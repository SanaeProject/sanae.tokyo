/**
 * A utility function to throttle the execution of a function.
 * It ensures that the function is called at most once every specified delay.
 *
 * @param func  - The function to be throttled.
 * @param delay - The time in milliseconds to wait before allowing the next call.
 *
 * @returns A throttled version of the provided function.
 */
let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
export function throttle<T extends (...args: any[]) => void>(func: T, delay: number) {
    return function(this: any, ...args: Parameters<T>) {
        if (!throttleTimeout) {
            func.apply(this, args);
            throttleTimeout = setTimeout(() => {
                throttleTimeout = null;
            }, delay);
        }
    };
}

export function getJsonFromFetch(url: string): Promise<any> {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            throw error;
        });
}