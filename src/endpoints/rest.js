
import express from 'express'
import {formatError} from "graphql"
import { join } from 'path'

import { encodeObjectsIdProps } from '../utils/utils'
import { readdirSync, statSync, existsSync } from 'fs'
import { parseValue } from './scalars/HashedId/HashedId'
import { createContext } from '../utils/auth'
import logger from '../utils/logger'

import { HttpError } from "../utils/HttpError"

const router = express.Router()
const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

const paths = []

router.use((req, res, next) => {
    req.origin = 'rest'

    createContext({ req, res })
        .then(context => {
            req.context = context
            next()
        })
        .catch(e => {
            throw HttpError.badRequest('internal_error')
        })

})

const selectFirstSubpath = (path) => {
    if (path.charAt(0) === '/') {
        path = path.substr(1)
    }

    return path.split('/')[0]
}

let errorStatus

const attachListeners = (path, ops, addId) => {

    const listener = (req, res, op) => {
        const queryArgs = req.query
        const params = req.params
        const bodyArgs = req.body

        // convert param lists to arrays
        Object.keys(queryArgs).forEach(arg => {
            if (queryArgs[arg].indexOf(',') > -1) {
                queryArgs[arg] = queryArgs[arg].split(',')
            }
        })

        const args = {
            ...(queryArgs || {}),
            ...(params || {}),
            ...(bodyArgs || {})
        }



        for (const key in args) {

            if (key === 'id' || key.endsWith('Id')) {
                args[key] = args[key]
                    ? Array.isArray(args[key])
                        ? args[key].map(id => {
                            try {
                                return parseValue(id)
                            } catch (e) {
                                throw HttpError.fromCode('id_invalid')
                            }
                        })
                        : (() => {
                            try {
                                return parseValue(args[key])
                            } catch (e) {
                                throw HttpError.fromCode('id_invalid')
                            }
                        })()
                    : null
            }

            if (args[key] === null) {
                delete args[key]
            }
        }

        if (!ops[op]) {
            throw HttpError.fromCode('id_invalid')
        }

        if (!errorStatus) {
            return ops[op]({ args: args, context: req.context, req, res })
                .then((result) => {
                    if (result) {
                        const rawResult =
                            encodeObjectsIdProps(
                                result.map(value => value.dataValues ? value.dataValues : value)
                            )

                        return res.status(200).json({ data: rawResult })
                    }

                    const preparedError = error('permission_error')
                    return res.status(preparedError.httpStatus).json(formatError(preparedError))
                }).catch(err => {
                    logger.error(err.message)
                    const preparedError = error('internal_error')
                    return res.status(preparedError.httpStatus).json(formatError(preparedError))
                })
        }

    }

    if (paths.indexOf(selectFirstSubpath(path)) > -1) {
        logger.error('Overwriting a previously declared path', {
            critical: true,
            path
        })
    } else {
        paths.push(selectFirstSubpath(path))
    }

    ['get', 'post', 'delete'].forEach(op => {

        const composedPath = (hasId) => router[op](`/${path.toLowerCase()}${(hasId ? '/:id' : '')}`,
            (req, res) => listener(req, res, op)
        )

        composedPath()

        if (addId) {
            composedPath(true)
        }
    })
}

const addToRestPaths = (item, subdir) => {

    const restPath = `${__dirname}/${subdir}/${item}/${item}.endpoints.rest.js`

    if (existsSync(restPath)) {
        const restMap = require(restPath).default

        if (restMap.ops) {
            attachListeners(item, restMap.ops, true)
        }

        if (restMap.custom) {
            restMap.custom.forEach((customPath) => {
                attachListeners(customPath.path, customPath.ops)
            })
        }
    }
}


dirs(`${__dirname}/methods`).forEach(method => addToRestPaths(method, 'methods'))
dirs(`${__dirname}/models`).forEach(model => addToRestPaths(model, 'models'))

export default router
