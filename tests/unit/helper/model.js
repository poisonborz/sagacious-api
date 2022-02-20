
export function rejectError (path) {
    return function (...args) {
        return Promise.reject(new Error(`Maybe you should mock ${path}, was called with:\n${JSON.stringify(args, null, 2)}`))
    }
}
