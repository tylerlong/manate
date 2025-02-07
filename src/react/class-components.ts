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
export class Component<P = undefined, S = undefined>
  extends ReactComponent<P, S> {
  private isTrigger?: (writeLog: WriteLog) => boolean;

  constructor(props: P) {
    super(props);
    const originalRender = this.render.bind(this);
    this.render = () => {
      const [element, isTrigger] = run(() => {
        return originalRender();
      });
      this.isTrigger = isTrigger;
      return element;
    };
    const listener = (writeLog: WriteLog) => {
      if (this.isTrigger?.(writeLog)) {
        this.forceUpdate();
      }
    };
    const originalDidMount = this.componentDidMount?.bind(this);
    this.componentDidMount = () => {
      writeEmitter.on(listener);
      originalDidMount?.();
    };
    const originalWillUnmount = this.componentWillUnmount?.bind(this);
    this.componentWillUnmount = () => {
      writeEmitter.off(listener);
      originalWillUnmount?.();
    };
  }
}

export const auto = <P = undefined, S = undefined>(
  Component: ComponentClass<P, S>,
) => {
  const FunctionComponent = c2f(Component);
  return fAuto(FunctionComponent);
};

// convert class component to function component
const c2f = <P = undefined, S = undefined>(
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
