const equal = require("deep-equal");

interface runningCallback {
    args: any[],
    resolve: ((...args: any) => any)[],
    reject: ((error: Error) => any)[],
}


/**
 * The GateKeeper function creates a instance of many keepers. All calls to the function with the same arguments will get bundled into one callback
 */
export function GateKeeper(callback: (...args: any) => Promise<any>) {

    /**
     * An object holding all of the promises currently active for this GateKeeper instance
     */
    const running: runningCallback[] = [];

    const get = function (...callArgs: any) {
        return new Promise((resolve, reject) => {

            // get the currently running result if its there
            const result = getCallback(callArgs, running);
            if (result) {
                result.reject.push(reject);
                result.resolve.push(resolve);

            } else {
                // create a new instance and save it to the list
                const instance: runningCallback = {
                    args: callArgs,
                    reject: [reject],
                    resolve: [resolve]
                };

                running.push(instance);

                callback(...callArgs)
                    .then(result => {
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
                    .catch(err => {
                        // get the running instance
                        const instance = getCallback(callArgs, running);
                        // reject all of the waiting promises
                        if (instance) {
                            for (const reject of instance.resolve) {
                                reject(err);
                            }
                            // delete the instance
                            deleteCallback(callArgs, running);
                        }
                    });
            }

        });
    }

    get.isCurrentlyGetting = (...callArgs: any) => {
        if (getCallback(callArgs, running)) {
            return true;
        } else {
            return false;
        }
    };

    get.cancel = (...callArgs: any) => {
        const instance = getCallback(callArgs, running);

        // delete the instance
        deleteCallback(callArgs, running);

        return instance;
    }

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