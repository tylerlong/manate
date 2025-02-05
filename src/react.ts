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
  return function FunctionComponentAdapter(props: P) {
    const [state, setState] = useState(() => {
      const instance = new ClassComponent(props);
      return instance.state || {};
    });

    const instanceRef = useRef<InstanceType<ComponentClass<P, S>>>(null);

    // Create or update class instance
    if (!instanceRef.current) {
      instanceRef.current = new ClassComponent(props);
      instanceRef.current.state = state;

      // Override setState to update React state
      instanceRef.current.setState = (newState) => {
        setState((prev) => ({ ...prev, ...newState }));
      };
    }

    // Update props and state in class instance when they change
    useEffect(() => {
      instanceRef.current!.props = props;
      instanceRef.current!.state = state;
    }, [props, state]);

    // Lifecycle handling
    useEffect(() => {
      if (instanceRef.current!.componentDidMount) {
        instanceRef.current!.componentDidMount();
      }
      return () => {
        if (instanceRef.current!.componentWillUnmount) {
          instanceRef.current!.componentWillUnmount();
        }
      };
    }, []);

    useEffect(() => {
      if (instanceRef.current!.componentDidUpdate) {
        instanceRef.current!.componentDidUpdate(props, state);
      }
    });

    // Handle shouldComponentUpdate
    const shouldUpdate = instanceRef.current.shouldComponentUpdate
      ? instanceRef.current.shouldComponentUpdate(props, state)
      : true;

    if (!shouldUpdate) {
      return null;
    }

    // Call render method
    return instanceRef.current.render();
  };
};
