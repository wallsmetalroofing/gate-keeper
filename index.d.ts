interface runningCallback {
    args: any[];
    resolve: ((...args: any) => any)[];
    reject: ((error: Error) => any)[];
}
/**
 * The GateKeeper function creates a instance of many keepers. All calls to the function with the same arguments will get bundled into one callback
 */
export declare function GateKeeper(callback: (...args: any) => Promise<any>): {
    (...callArgs: any): Promise<unknown>;
    isCurrentlyGetting(...callArgs: any): boolean;
    cancel(...callArgs: any): runningCallback | null;
};
export {};
