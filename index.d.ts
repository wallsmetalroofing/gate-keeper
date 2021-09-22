interface runningCallback {
    args: any[];
    resolve: ((...args: any) => any)[];
    reject: ((error: Error) => any)[];
}
declare type GateKeeperReturn<ReturnValue, CallbackArgs extends Array<any>> = {
    (...callArgs: CallbackArgs): Promise<ReturnValue>;
    isCurrentlyGetting(...callArgs: any[]): boolean;
    cancel(...callArgs: any[]): runningCallback | null;
};
/**
 * The GateKeeper function creates a instance of many keepers.
 * All calls to the function with the same arguments will get bundled into one callback
 */
export declare function GateKeeper<CallbackReturn, CallbackArgs extends Array<any>>(callback: (...args: CallbackArgs) => Promise<CallbackReturn>): GateKeeperReturn<CallbackReturn, CallbackArgs>;
/**
 * Register a callback function to run when the gatekeeper registers a hit.
 *
 * A hit is registered when a previously started callback can be used
 *
 * @param callback the callback to run
 */
export declare function GateKeeperHit(callback: (label?: string) => void): void;
/**
 * Register a callback function to run when the gatekeeper registers a miss.
 *
 * A miss is registered when a new callback stack is created.
 *
 * @param callback the callback to run
 */
export declare function GateKeeperMiss(callback: (label?: string) => void): void;
export {};
