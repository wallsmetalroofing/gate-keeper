const equal = require("deep-equal");

interface runningCallback {
    args: any[];
    resolve: ((...args: any) => any)[];
    reject: ((error: Error) => any)[];
}

type GateKeeperReturn<ReturnValue, CallbackArgs extends Array<any>> = {
    (...callArgs: CallbackArgs): Promise<ReturnValue>;
    isCurrentlyGetting(...callArgs: any[]): boolean;
    cancel(...callArgs: any[]): runningCallback | null;
};

/**
 * Callback to keep track of hit and miss stats
 * @param args
 */
let registerHit = (label?: string) => {};
/**
 * Callback to keep track of hit and miss stats
 * @param args
 */
let registerMiss = (label?: string) => {};

/**
 * The GateKeeper function creates a instance of many keepers.
 * All calls to the function with the same arguments will get bundled into one callback
 */
export function GateKeeper<CallbackReturn, CallbackArgs extends Array<any>>(
    callback: (...args: CallbackArgs) => Promise<CallbackReturn>,
    options?: { label?: string }
): GateKeeperReturn<CallbackReturn, CallbackArgs> {
    /**
     * The label used for the metrics callbacks
     */
    let label: undefined | string =
        options && options.label ? options.label : undefined;

    /**
     * An object holding all of the promises currently active for this GateKeeper instance
     */
    const running: runningCallback[] = [];

    const get = function (...callArgs: any): Promise<any> {
        return new Promise((resolve, reject) => {
            // get the currently running result if its there
            const result = getCallback(callArgs, running);
            if (result) {
                // add the reject and resolve callbacks to the callback stack
                result.reject.push(reject);
                result.resolve.push(resolve);

                registerHit(label);
            } else {
                // create a new instance and save it to the list
                const instance: runningCallback = {
                    args: callArgs,
                    reject: [reject],
                    resolve: [resolve],
                };

                running.push(instance);

                // run the callback function to get the values
                callback(...callArgs)
                    .then((result) => {
                        // get the running instance
                        const instance = getCallback(callArgs, running);

                        // resolve all of the waiting promises
                        if (instance) {
                            for (const resolve of instance.resolve) {
                                resolve(result);
                            }

                            // delete the instance
                            deleteCallback(callArgs, running);
                        }
                    })
                    .catch((err) => {
                        // get the running instance
                        const instance = getCallback(callArgs, running);

                        // reject all of the waiting promises
                        if (instance) {
                            for (const reject of instance.reject) {
                                reject(err);
                            }

                            // delete the instance
                            deleteCallback(callArgs, running);
                        }
                    });

                registerMiss(label);
            }
        });
    };

    get.isCurrentlyGetting = (...callArgs: any[]) => {
        if (getCallback(callArgs, running)) {
            return true;
        } else {
            return false;
        }
    };

    get.cancel = (...callArgs: any[]) => {
        const instance = getCallback(callArgs, running);

        // delete the instance
        deleteCallback(callArgs, running);

        return instance;
    };

    /**
     * Set the label to use in the metrics callbacks
     *
     * @param name
     * @returns
     */
    get.setLabel = (name: string) => (label = name);

    return get;
}

function getCallback(args: any[], running: runningCallback[]) {
    for (const instance of running) {
        // find the running callback and return the object
        if (equal(args, instance.args)) {
            return instance;
        }
    }
    return null;
}

function deleteCallback(args: any[], running: runningCallback[]) {
    for (let i = running.length - 1; i >= 0; i--) {
        if (equal(args, running[i].args)) {
            // remove the element from array
            running.splice(i, 1);
        }
    }
}

/**
 * Register a callback function to run when the gatekeeper registers a hit.
 *
 * A hit is registered when a previously started callback can be used
 *
 * @param callback the callback to run
 */
export function GateKeeperHit(callback: (label?: string) => void) {
    registerHit = callback;
}

/**
 * Register a callback function to run when the gatekeeper registers a miss.
 *
 * A miss is registered when a new callback stack is created.
 *
 * @param callback the callback to run
 */
export function GateKeeperMiss(callback: (label?: string) => void) {
    registerMiss = callback;
}
