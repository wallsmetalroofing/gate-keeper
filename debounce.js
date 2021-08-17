"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
/**
 * debounce the callback function.
 *
 * The callback function will always run with the most recent args
 *
 * @param callback the callback to run
 * @param options
 * @returns
 */
function debounce(callback, options) {
    const opt = Object.assign({ timeout: 250, cancelOnTrigger: true }, options);
    let timeoutId = null;
    let lastArgs;
    return {
        callback: (...args) => {
            // set the latest args
            lastArgs = args;
            if (opt.cancelOnTrigger) {
                // clear the previous timeout
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                // create new timer
                timeoutId = setTimeout(() => {
                    timeoutId = null;
                    callback(...lastArgs);
                }, opt.timeout);
            }
            else {
                // check if there is an existing timer. If not create one
                if (!timeoutId) {
                    timeoutId = setTimeout(() => {
                        timeoutId = null;
                        callback(...lastArgs);
                    }, opt.timeout);
                }
            }
        },
        /**
         * Cancels the previous timeout and calls the function immediately with the previous args given
         */
        immediate: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            return callback(...lastArgs);
        },
    };
}
exports.debounce = debounce;
exports.default = debounce;
