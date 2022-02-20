
import { createLogger, format, transports } from 'winston'
import get from 'lodash/get'

const { colorize, combine, json, label, timestamp, simple } = format
const isDev = process.env.NODE_ENV === 'development'

const formats = [label({ label: 'SAG_API' }), timestamp()]

if (isDev) {
    formats.push(colorize(), simple())
} else {
    formats.push(json())
}

const _logger = createLogger({
    level: isDev ? 'debug' : 'warn',
    format: combine(
        ...formats
    ),
    transports: [new transports.Console({
        stderrLevels: ['error'],
        consoleWarnLevels: ['warn']
    })]
})

function withLevel (level) {
    /**
     * If `critical` is present in the meta and its value is true
     * the message will be logged and the process will exit
     * @param {string} message a summarazing message
     * @param {object} meta additional info attached to the log
     */
    function log (message, meta = {}) {
        _logger.log({
            ...meta,
            message,
            level
        })
        if (meta.critical === true) {
            process.exit(1)
        }
    }
    return log
}

const logger = {
    debug: withLevel('debug'),
    info: withLevel('info'),
    warn: withLevel('warn'),
    error: withLevel('error')
}

/**
 * Will try to log the error. This is used in middleware-like functions.
 * For graphql endpoints it's called inside `formatError`.
 * For rest endpoints it's called by `errorHandler` wrapper
 * DO NOT CALL THIS INSIDE HANDLERS OR RESOLVERS
 * @param {Error} error the error to log
 * @param {string} source from where the error generated (rest|graphql)
 */
export function tryLogError (error, source) {
    let internalError = false
    if (source === 'graphql') {
        // Graphql will transform the error
        internalError = ['internal_error', 'INTERNAL_SERVER_ERROR'].includes(error.extensions.code)
    } else {
        // If not specified otherwise all errors are considered internal error
        internalError = get(error, 'httpStatus', 500) > 499
    }
    if (internalError) {
        if (error.originalError) {
            error = error.originalError
        }
        const meta = {
            source,
            // Errors that are fired while creating the context don't have an originalError
            stack: error.stack || error.extensions.exception.stacktrace.join('\n')
        }
        if ('sql' in error) {
            meta['sql'] = error.sql
        }
        logger.error(error.message, meta)
    }
}

export default logger
