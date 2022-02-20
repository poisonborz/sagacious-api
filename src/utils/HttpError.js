
import { errorList, generalCodes } from './errorList'

// A custom http error that can be raised at any time

export class HttpError extends Error {
    /**
     * A new HttpError ready to be thrown
     * @param {string} code the code of the error, will be set in the extensions
     * @param {string} message message for this error
     * @param {number} [httpStatus] status used in REST API
     */
    constructor (code, message, httpStatus = 500) {
        super(message)
        this.extensions = { code }
        this.httpStatus = httpStatus
        Object.defineProperty(this, 'name', { value: 'HttpError' })
    }

    /**
     * Create a new HttpError by proving the error code.
     * The `code` should be present in the `errorList`
     * @param {string} code the code of the error
     * @return {HttpError} a new error
     */
    static fromCode (code) {
        // Intentionally unsafe - make sure the code exists in the list before using it
        const error = errorList[code]
        return new HttpError(code, error.message, error.httpStatus)
    }

    /**
     * Create a bad request error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static badRequest (message) {
        return HttpError._fromGeneralCodes('bad_request', message)
    }

    /**
     * Create an unauthorized error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static unauthorized (message) {
        return HttpError._fromGeneralCodes('unauthorized', message)
    }

    /**
     * Create a forbidden error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static forbidden (message) {
        return HttpError._fromGeneralCodes('forbidden', message)
    }

    /**
     * Create a not found error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static notFound (message) {
        return HttpError._fromGeneralCodes('not_found', message)
    }

    /**
     * Create a method not allowed error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static methodNotAllowed (message) {
        return HttpError._fromGeneralCodes('method_not_allowed', message)
    }

    /**
     * Create a conflict error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static conflict (message) {
        return HttpError._fromGeneralCodes('conflict', message)
    }

    /**
     * Create an unprocessable entity error with a general error code.
     * @param {string} message the message of the error
     * @return {HttpError} the new error
     */
    static unprocessableEntity (message) {
        return HttpError._fromGeneralCodes('unprocessable_entity', message)
    }

    static _fromGeneralCodes (code, message) {
        const data = generalCodes[code]
        return new HttpError(code, message || data.message, data.httpStatus)
    }
}
