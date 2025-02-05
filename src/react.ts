import {
  type ComponentClass,
  type FunctionComponent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import { WriteLog } from "./events/types.js";
import writeEmitter from "./events/write-emitter.js";
import { run } from "./utils.js";

export const auto = <P, S>(
  Component: FunctionComponent<P> | ComponentClass<P, S>,
) => {
  return memo(function MyComponent(props: P) {
    const [, reRender] = useState(0);
    if (Component.prototype?.render) { // class component has render method
      Component = c2f(Component as ComponentClass<P, S>); // convert to function component
    }
    const [r, isTrigger] = run(() =>
      (Component as FunctionComponent<P>)(props)
    );
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

    // @ts-ignore
    instanceRef.current.props = props; // class component is not mounted, it is safe to update props directly
    return instanceRef.current.render();
  };
  return functionComponent;
};
