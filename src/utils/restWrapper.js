
import get from 'lodash/get'

import { errorList } from './errorList'
import { tryLogError } from './logger'

const isProd = process.env.NODE_ENV === 'production'

export default function errorHandler (handler) {
    return async function (req, res, next) {
        try {
            await handler(req, res, next)
        } catch (error) {
            tryLogError(error, 'rest')
            const status = get(error, 'httpStatus', 500)
            const hideError = isProd && status === 500
            return res.status(status).json({
                errors: [
                    {
                        message: hideError ? errorList.internal_error.message : error.message,
                        extensions: {
                            code: get(error, 'extensions.code', 'internal_error')
                        }
                    }
                ]
            })
        }
    }
}
