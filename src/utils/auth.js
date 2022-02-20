
import jwt from 'jsonwebtoken'
import models from '../endpoints/models'
import bcrypt from 'bcryptjs'
import ua from 'universal-analytics'
import Sequelize from 'sequelize'
import shortid from 'shortid'
import shorthash from 'shorthash'

import { getSecret } from './secrets'
import logger from './logger'
import { HttpError } from './HttpError'
import { parseValue, composeValue } from '../endpoints/scalars/HashedId/HashedId'

import { buildContext } from './context'
import { toTime } from './utils'
import buildTime from './buildTime'

const Op = Sequelize.Op

const JWT_SECRET = process.env.JWT_SECRET || getSecret(process.env.JWT_SECRET_FILE)

if (!JWT_SECRET) {
    logger.error('No jwt secret found', { critical: true })
}

const calcExpirationDate = (expirationTime) => {
    const timeUnitArr = expirationTime.match(/(\d+)([A-Za-z]+)/).slice(1)
    const timeObj = toTime(timeUnitArr[0], timeUnitArr[1], true)

    return Math.round((new Date(
        (new Date()).setSeconds(
            (new Date()).getSeconds() + timeObj.valueInSeconds
        )
    )).getTime() / 1000)
}

const createAccessToken = async (userId) => {

    const accessExpirationTime = process.env.TOKEN_EXPIRATION

    return {
        tokenAccess: jwt.sign(
            {
                userId: composeValue(userId)
            },
            JWT_SECRET,
            { expiresIn: accessExpirationTime }
        ),
        buildTime,
        tokenAccessExpiration: calcExpirationDate(accessExpirationTime)
    }
}

const addPayloadUser = async (payload, user) => {
    delete user.password
    delete user.activated

    delete user.userGroup // user groups should be fetched separately

    user.id = composeValue(user.id)
    user.languageId = composeValue(user.languageId)
    user.roleId = composeValue(user.roleId)
    user.created = (new Date(user.created)).getTime() / 1000
    user.belongsToGroupId = composeValue(user.belongsToGroupId)

    payload.user = user

    return payload
}

const addPayloadRefresh = async (payload, userId, meta) => {

    const sessionId = shortid.generate()
    const refreshExpirationTime = process.env.TOKEN_REFRESH_EXPIRATION || '45d'

    payload.tokenRefreshExpiration = calcExpirationDate(refreshExpirationTime)

    await models.Login.create({
        id: sessionId,
        userId: userId,
        meta,
        metaHash: shorthash.unique(meta),
        expiration: new Date(payload.tokenRefreshExpiration * 1000)
    })


    payload.tokenRefresh = jwt.sign(
        {
            sessionId: sessionId,
            buildTime
        },
        JWT_SECRET,
        { expiresIn: refreshExpirationTime }
    )

    return payload
}

export const cleanStaleRefreshTokens = () => {
    return models.Login.destroy({
        where: {
            expiration: {
                isBefore: new Date()
            }
        }
    })
}

const getAuthTokens = async ({ name, password }, req, res) => {

    return models.User.findOne({
        raw: true,
        attributes: [
            'password',
            'id',
            'email',
            'roleId',
            'languageId',
            'isAdmin',
            'firstname',
            'lastname',
            'created',
            'activated',
            'phone',
            'image',
            'belongsToGroupId'
        ],
        where: {
            [Op.or]: [
                {
                    email: name
                }
            ]
        },
        context: {
            authUser: {
                name
            }
        },
        includeAdmin: true,
        groupAffiliationHandled: true
    }).then(async (user) => {
        if (user) {
            const localContext = {
                authUser: user
            }

            const options = { context: await buildContext(req, user.id, req.headers['project']) }

            const userGroup = await models.Group.findOne({
                raw: true,
                where: {
                    id: user.belongsToGroupId
                },
                groupAffiliationHandled: true,
                context: localContext
            })

            user.userGroup = userGroup

            const usersGroups = options.context.__allGroups

            const userRole = await models.Role.findOne({
                raw: true,
                where: {
                    id: user.roleId
                },
                context: {
                    ...localContext,
                    usersGroups
                }
            })

            user.roleKey = userRole.key

            return user
        }
        return null
    }).then(user => {
        if (user) {
            return (async () => {
                if (process.env.NODE_ENV === 'development' && process.env.DEV_DISABLE_AUTH) {
                    return true
                } else {
                    return bcrypt.compare(password, user.password)
                }
            })().then(res => {
                const meta = (req.headers['x-forwarded-for']
                    ? (req.headers['x-forwarded-for'] + ' | ') : '') + req.headers['user-agent']

                if (res) {
                    return createAccessToken(user.id)
                        .then(payload => addPayloadUser(payload, user))
                        .then(payload =>
                            addPayloadRefresh(payload, parseValue(user.id), meta)
                        )
                } else {
                    return false
                }
            })
        }
    })
}

const trackAuth = (req, userEmail, action) => {
    if (process.env.ANALYTICS_KEY) {

        (ua(
            process.env.ANALYTICS_KEY,
            userEmail,
            {
                uid: userEmail,
                strictCidFormat: false
            })
        ).event('engagement', action, userEmail, null, { client: req.headers['project'] }).send()
    }

    if (req.headers['x-analytics-key']) {
        (ua(
            req.headers['x-analytics-key'].toUpperCase(),
            userEmail,
            {
                uid: userEmail,
                strictCidFormat: false
            })
        ).event('engagement', action, userEmail).send()
    }
}

export const authenticate = async (req, res, next) => {

    if (!req.body.name || !req.body.password) {
        throw HttpError.fromCode('login_invalid')
    }

    req.headers['project'] = getProjectFromHeaders(req)

    const userToken = await getAuthTokens(req.body, req, res)

    if (userToken) {
        trackAuth(req, userToken.user.email, 'login')
        return res.json(userToken)
    } else {
        throw HttpError.fromCode('login_invalid')
    }
}

export const isValidSession = async token => {
    if (!(token && (token.sessionId || token.userId))) {
        return false
    }

    const where = {}

    if (token.sessionId) {
        where['id'] = token.sessionId
    }

    if (token.userId) {
        // userId in token is hashedId
        where['userId'] = parseValue(token.userId)
    }

    return models.Login.findOne({
        where,
        order: [[Sequelize.col('created'), 'DESC']],
        groupAffiliationHandled: true
    }).then(session => {
        return !(session && session.revoked)
    }).catch(e => {
        return false
    })
}

export const refreshToken = async (req, res, next) => {
    if (!req.body.refresh) {
        throw HttpError.fromCode('no_refresh_token')
    }
    let tokenObj
    try {
        tokenObj = await verifyToken(req.body.refresh, 'rest')
    } catch (e) {
        throw HttpError.fromCode('login_invalid')
    }

    if (tokenObj.exp && tokenObj.exp < (Date.now() / 1000)) {
        throw HttpError.fromCode('expired_token')
    }

    if (!tokenObj.sessionId) {
        throw HttpError.fromCode('invalid_token')
    }
    const session = await models.Login.findOne({
        where: {
            id: tokenObj.sessionId
        },
        include: [{ model: models.User, as: 'user' }],
        groupAffiliationHandled: true
    })
    if (!session) {
        throw HttpError.fromCode('invalid_token')
    }
    if (session.revoked || session.expiration < (Date.now() / 1000)) {
        throw HttpError.fromCode('expired_token')
    }

    const token = await createAccessToken(session.userId)
    trackAuth(req, (session.user || {}).email, 'tokenRefresh')
    return res.json(token)
}

export const verifyToken = async (token, origin = 'gql') => {
    return jwt.verify(token, JWT_SECRET, async (err, response) => {
        if (err || !(await isValidSession(response))) {
            throw HttpError.fromCode('invalid_token')
        }
        return response
    })
}

export const getProjectFromHeaders = (req) => {
    return req.headers['project'] || ''
}

export const createContext = async ({ req, res }) => {

    if (req.headers.authorization) {
        let tokenObj

        tokenObj = await verifyToken(
            req.headers.authorization, req.origin === 'rest' ? req.origin : 'gql'
        )

        if (tokenObj.userId) {
            try {
                return buildContext(
                    req,
                    parseValue(tokenObj.userId),
                    getProjectFromHeaders(req),
                    req.headers['current-group-id'] ? parseValue(req.headers['current-group-id']) : 0
                )
            } catch (error) {
                if (error instanceof Error && error.message.startsWith('Indecipherable')) {
                    throw HttpError.badRequest(error.message)
                }
                throw error
            }
        }

    } else {
        throw HttpError.fromCode('invalid_token')
    }
}
