import {
  ComponentClass,
  type FunctionComponent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import { WriteLog } from "./events/types.js";
import writeEmitter from "./events/write-emitter.js";
import { run } from "./utils.js";

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, reRender] = useState(0);
    const [r, isTrigger] = run(() => Component(props));
    useEffect(() => {
      const listener = (writeLog: WriteLog) => {
        if (isTrigger(writeLog)) {
          reRender((n) => n + 1);
        }
      };
      writeEmitter.on(listener);
      return () => {
        writeEmitter.off(listener);
      };
    }, [isTrigger]);
    return r;
  });
};

// convert class component to function component
export const c2f = <P, S>(
  ClassComponent: ComponentClass<P, S>,
): FunctionComponent<P> => {
  const functionComponent = (props: P) => {
    const instanceRef = useRef<InstanceType<ComponentClass<P, S>>>(
      new ClassComponent(props),
    );
    const [, setState] = useState(instanceRef.current.state);
    const _setState = instanceRef.current.setState.bind(instanceRef.current);
    instanceRef.current.setState = (newState) => {
      _setState(newState);
      setState((prev) => ({ ...prev, ...newState }));
    };

    // class component is not mounted, so it is safe to update props directly
    // @ts-ignore
    instanceRef.current.props = props;
    useEffect(() => {
      instanceRef.current.componentDidMount?.();
      return () => {
        instanceRef.current.componentWillUnmount?.();
      };
    }, []);
    return instanceRef.current.render();
  };
  return functionComponent;
};
