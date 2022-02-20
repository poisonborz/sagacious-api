
import ensureRequiredEnvVars from './utils/envChecker'

import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { importSchema } from 'graphql-import'
import dotenv from 'dotenv'

import db from './utils/database'
import resolvers from './endpoints/resolvers'
import { passwordReset } from './utils/passwordReset'
import { passwordSet } from './utils/passwordSet'
import { createContext, authenticate, refreshToken, cleanStaleRefreshTokens } from './utils/auth'
import restRoutes from './endpoints/rest'
import { availableLanguages } from './utils/lang'
import { allowedFileTypes } from './utils/documents'
import buildTime from './utils/buildTime'
import logger, { tryLogError } from './utils/logger'
import errorHandler from './utils/restWrapper'
import { errorList } from './utils/errorList'
import { clearOldTransientFiles } from "./utils/transientFile"

dotenv.config()
const dotenvSet = (dotenv.config()).parsed

try {
    ensureRequiredEnvVars()
} catch (e) {
    logger.error(e.message, { stack: e.stack, critical: true })
}

export const app = express()
app.set('trust proxy', '10.0.0.0/8')

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'
const typeDefsWithUpload = importSchema('./src/endpoints/scheme.graphql')

// avoid duplicate declaration by apollo-server
const typeDefs = typeDefsWithUpload.replace('scalar Upload', '')

const api = new ApolloServer({
    tracing: process.env.NODE_ENV !== 'production',
    typeDefs,
    resolvers,
    context: ({ req, res }) => createContext({ req, res }),
    formatError: error => {
        tryLogError(error, 'graphql')
        if (process.env.NODE_ENV === 'production') {
            delete error.extensions.exception
            if (['internal_error', 'INTERNAL_SERVER_ERROR'].includes(error.extensions.code)) {
                error.message = errorList.internal_error.message
            }
        }

        return error
    },
    formatResponse: (res, options) => {
        return res
    },
    uploads: {
        maxFileSize: 100 * 1024 * 1024, // 100 MB
        maxFiles: 20
    },
    playground: process.env.NODE_ENV === 'development',
    introspection: true
})

api.applyMiddleware({
    app,
    bodyParserConfig: {
        limit: '5mb'
    }
})

app.use(helmet())
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(express.json({ extended: true, limit: '5mb', parameterLimit: 100000 }))

app.use((req, res, next) => {
    res.set('buildTime', buildTime)
    next()
})

app.use('/rest', restRoutes)

app.use(express.static(path.join(__dirname, 'public')))

if (process.env.NODE_ENV !== 'test') {
    app.use(
        morgan('combined', {
            skip: (req, res) => {
                return res.statusCode < 400
            }
        })
    )
}

app.get('/pulse', (req, res, next) => {
    if (req.query.withDependencies) {
        db.query('SELECT email from User where id=1')
            .spread(dbResult => {
                res.json({ status: 'api is up, can reach dependencies' })
            })
            .catch(err => {
                logger.error(err.message, { stack: err.stack })
                res.status(400).json({ status: 'dependencies unreachable' })
            })
    } else {
        res.json({ status: 'up' })
    }
})

app.all('/languages', errorHandler(availableLanguages))
app.all('/allowedFileTypes', (req, res, next) => {
    return res.json(Array.from(allowedFileTypes))
})
app.post('/auth', errorHandler(authenticate))
app.post('/authRefresh', errorHandler(refreshToken))
app.use('/auth/password-reset', passwordReset)
app.use('/auth/password-set', passwordSet)

app.get('/', (req, res, next) => {
    return res.sendFile(path.join(__dirname, '/public/index.html'))
})
app.get('/buildTime', (req, res) => {
    return res.send({ buildTime })
})

app.use('/docs/graphql', express.static(path.join(__dirname, '../docs/graphql')))
app.use('/docs/public', express.static(path.join(__dirname, '../docs/public')))
app.use('/docs/rest', express.static(path.join(__dirname, '../docs/rest')))

db.authenticate()
    .then(() => {
        app.listen(port, host, (err, res) => {
            if (err) {
                logger.error(err.message, { stack: err.stack, critical: true })
            } else {

                if (process.env.NODE_ENV === 'production') {
                    cron.schedule('*/60 * * * *', () => {
                        clearOldTransientFiles()
                            .catch(logger.error)
                    })

                    cron.schedule('0 23 */2 * *', () => {
                       cleanStaleRefreshTokens
                            .catch(logger.error)
                    })
                }

                const dbname = dotenvSet ? dotenvSet.DBNAME : (process.env.DBNAME)

                logger.info(
                    'Sagacious API started', { db: dbname, url: `http://${host}:${port}` }
                )
            }
        })

    }).catch(err => {
        logger.error(err.message, {
            stack: err.stack,
            critical: true
        })
    })
