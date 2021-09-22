"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateKeeperMiss = exports.GateKeeperHit = exports.GateKeeper = void 0;
const equal = require("deep-equal");
/**
 * Callback to keep track of hit and miss stats
 * @param args
 */
let registerHit = (label) => { };
/**
 * Callback to keep track of hit and miss stats
 * @param args
 */
let registerMiss = (label) => { };
/**
 * The GateKeeper function creates a instance of many keepers.
 * All calls to the function with the same arguments will get bundled into one callback
 */
function GateKeeper(callback) {
    /**
     * The label used for the metrics callbacks
     */
    let label = undefined;
    /**
     * An object holding all of the promises currently active for this GateKeeper instance
     */
    const running = [];
    const get = function (...callArgs) {
        return new Promise((resolve, reject) => {
            // get the currently running result if its there
            const result = getCallback(callArgs, running);
            if (result) {
                // add the reject and resolve callbacks to the callback stack
                result.reject.push(reject);
                result.resolve.push(resolve);
                registerHit(label);
            }
            else {
                // create a new instance and save it to the list
                const instance = {
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
    get.isCurrentlyGetting = (...callArgs) => {
        if (getCallback(callArgs, running)) {
            return true;
        }
        else {
            return false;
        }
    };
    get.cancel = (...callArgs) => {
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
    get.setLabel = (name) => (label = name);
    return get;
}
exports.GateKeeper = GateKeeper;
function getCallback(args, running) {
    for (const instance of running) {
        // find the running callback and return the object
        if (equal(args, instance.args)) {
            return instance;
        }
    }
    return null;
}
function deleteCallback(args, running) {
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
function GateKeeperHit(callback) {
    registerHit = callback;
}
exports.GateKeeperHit = GateKeeperHit;
/**
 * Register a callback function to run when the gatekeeper registers a miss.
 *
 * A miss is registered when a new callback stack is created.
 *
 * @param callback the callback to run
 */
function GateKeeperMiss(callback) {
    registerMiss = callback;
}
exports.GateKeeperMiss = GateKeeperMiss;
