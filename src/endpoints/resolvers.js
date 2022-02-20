
import merge from 'merge'
import { readdirSync, statSync, existsSync } from 'fs'
import path from 'path'

import logger from '../utils/logger'

const dirs = p => readdirSync(p).filter(f => statSync(path.join(p, f)).isDirectory())

let resolvers = []
let scalars = []
let resolverTypes = ['Query', 'Mutation']

const addToResolvers = (resolverTopic, subdir) => {
    const resolverPath = path.join(__dirname, subdir, resolverTopic, resolverTopic + '.endpoints.resolvers.js')

    if (existsSync(resolverPath)) {
        resolvers.push(require(resolverPath).default)
        if (resolverTypes.indexOf(resolverTopic) === -1) {
            resolverTypes.push(resolverTopic)
        }
    }
}

const addToScalars = (resolverTopic, subdir) => {
    scalars.push(require(path.join(__dirname, subdir, resolverTopic, resolverTopic + '.js')).default)
}

dirs(`${__dirname}/methods`).forEach((method) => addToResolvers(method, 'methods'))
dirs(`${__dirname}/models`).forEach((model) => addToResolvers(model, 'models'))

dirs(`${__dirname}/scalars`).forEach((scalars) => addToScalars(scalars, 'scalars'))


resolverTypes = resolverTypes.map(queryType => {
    let checkedResolvers = {}

    resolvers.forEach(resolver => {

        if (resolver[queryType]) {
            // check if properties do not overwrite previous resolvers
            const mergedProps = Object.keys(checkedResolvers).concat(Object.keys(resolver[queryType]))

            if ([...new Set(mergedProps)].length === Object.keys(mergedProps).length) {
                merge(checkedResolvers, resolver[queryType])
            } else {
                logger.error('One of these resolvers overwrites previously declared ones', {
                    resolvers: Object.keys(resolver[queryType]),
                    critical: true
                })
            }
        }

    })

    return Object.keys(checkedResolvers).length ? { [queryType]: checkedResolvers } : {}
})
    .filter(resolver => Object.keys(resolver).length)

let checkedScalars = []
resolverTypes = resolverTypes.concat(scalars.map(scalarType => {
    // check if properties do not overwrite previous resolvers
    const mergedProps = Object.keys(checkedScalars).concat(Object.keys(scalarType))

    if ([...new Set(mergedProps)].length === Object.keys(mergedProps).length) {
        checkedScalars.push(scalarType)
    } else {
        logger.error('One of these scalars overwrites previously declared ones', {
            scalars: Object.keys(scalarType),
            critical: true
        })
    }

    return scalarType
}))

export default resolverTypes
