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
export declare function debounce<Args extends Array<any>, CallbackRet>(callback: (...args: Args) => CallbackRet, options: Partial<DebounceOptions>): {
    callback: (...args: Args) => void;
    immediate: () => void;
};
export default debounce;
