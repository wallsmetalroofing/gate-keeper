interface DebounceOptions {
    /**
     * The time to wait to call
     */
    timeout: number;

    /**
     * Tells if the previous timeout should be cancelled on callback trigger
     */
    cancelOnTrigger: boolean;
}

/**
 * debounce the callback function.
 *
 * The callback function will always run with the most recent args
 *
 * @param callback the callback to run
 * @param options
 * @returns
 */
export function debounce<Args extends Array<any>, CallbackRet>(
    callback: (...args: Args) => CallbackRet,
    options: Partial<DebounceOptions>
): { callback: (...args: Args) => void; immediate: () => void } {
    const opt: DebounceOptions = {
        timeout: 250,
        cancelOnTrigger: true,
        ...options,
    };

    let timeoutId: NodeJS.Timeout | null = null;
    let lastArgs: Args;

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
            } else {
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
export default debounce;
