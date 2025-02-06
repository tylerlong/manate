import {
  Component as ReactComponent,
  ComponentClass,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";

import { auto as fAuto } from "./index.js";
import { WriteLog } from "../events/types.js";
import writeEmitter from "../events/write-emitter.js";
import { run } from "../utils.js";

// code copied from https://github.com/tylerlong/manate/pull/8/files with minor modifications
export class Component<P, S> extends ReactComponent<P, S> {
  private isTrigger?: (writeLog: WriteLog) => boolean;
  private originalRender: () => React.ReactNode;

  constructor(props: P) {
    super(props);
    this.originalRender = this.render;
    this.render = this.autoRender;
    const originalDidMount = this.componentDidMount?.bind(this);
    this.componentDidMount = () => {
      writeEmitter.on(this.handleWrite);
      originalDidMount?.();
    };
    const originalWillUnmount = this.componentWillUnmount?.bind(this);
    this.componentWillUnmount = () => {
      writeEmitter.off(this.handleWrite);
      originalWillUnmount?.();
    };
  }

  private handleWrite = (writeLog: WriteLog) => {
    if (this.isTrigger && this.isTrigger(writeLog)) {
      this.forceUpdate();
    }
  };

  private autoRender = () => {
    const [element, isTrigger] = run(() => {
      return this.originalRender();
    });
    this.isTrigger = isTrigger;
    return element;
  };
}

export const auto = <P, S>(Component: ComponentClass<P, S>) => {
  const FunctionComponent = c2f(Component);
  return fAuto(FunctionComponent);
};

// convert class component to function component
const c2f = <P, S>(
  ClassComponent: ComponentClass<P, S>,
): FunctionComponent<P> => {
  const functionComponent = (props: P) => {
    const instanceRef = useRef<InstanceType<ComponentClass<P, S>>>(
      new ClassComponent(props),
    );
    const [, reRender] = useState(0);
    const _setState = instanceRef.current.setState.bind(instanceRef.current);
    instanceRef.current.setState = (...args) => {
      _setState(...args);
      reRender((n) => n + 1);
    };

    useEffect(() => {
      instanceRef.current.componentDidMount?.();
      return () => {
        instanceRef.current.componentWillUnmount?.();
      };
    }, []);

    // @ts-ignore class component is not mounted, it is safe to update props directly
    instanceRef.current.props = props;
    return instanceRef.current.render();
  };
  return functionComponent;
};
