declare module 'configstore' {
  class ConfigStore {
    constructor(name: string, defaults?: any)

    /*
     Set an item
     */
    set(key: string, val: any): void;

    /*
     Get an item
     */
    get(key: string): any;

    /*
     Delete an item
     */
    del(key: string): void;
  }

  export = ConfigStore
}