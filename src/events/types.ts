export type WriteEvent = {
  target: object;
  prop: PropertyKey;
  value: number;
};
export type GetEvent = {
  target: object;
  prop: PropertyKey;
  value: any;
};
export type HasEvent = {
  target: object;
  prop: PropertyKey;
  value: boolean;
};
export type KeysEvent = {
  target: object;
};

// Why Map key any? Because we want to support Map/Set whose keys can be any type
export type WriteLog = Map<object, Map<any, number>>;

export type ReadLog = Map<
  object,
  {
    get?: Map<any, any>;
    has?: Map<any, boolean>;
    keys?: boolean;
  }
>;
