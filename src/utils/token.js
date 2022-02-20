
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'

import models from '../endpoints/models'
import { getSecret } from './secrets'
import logger from './logger'

const JWT_SECRET = process.env.JWT_SECRET || getSecret(process.env.JWT_SECRET_FILE)

if (!JWT_SECRET) {
    logger.error('No jwt secret found', { critical: true })
}

/**
 * Generate a revokable JWT token
 * @param {Object} payload
 * @param {Object} options
 */
export const generateOneTimeToken = async (payload, options) => {
    const nonce = await models.Nonce.create(
        { value: uuid() }
    )
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            JWT_SECRET,
            {
                ...options,
                jwtid: nonce.value
            },
            (err, token) => err ? reject(err) : resolve(token)
        )
    })
}

export const verifyOneTimeToken = async (token, revoke = false) => {
    const { jti, ...payload } = await new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, data) => err ? reject(err) : resolve(data))
    })

    const nonce = await models.Nonce.findByPk(jti)

    if (!nonce) {
        throw new Error('Token is invalid')
    }

    if (revoke) {
        await nonce.destroy()
    }

    return payload
}

export const revokeOneTimeToken = async (token) => {
    const { jti } = jwt.decode(token)

    const nonce = await models.Nonce.findByPk(jti)

    if (nonce) {
        await nonce.destroy()
    }
}
