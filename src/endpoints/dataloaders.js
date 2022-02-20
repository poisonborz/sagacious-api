
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

import logger from '../utils/logger'

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

const models = dirs(`${__dirname}/models`).reduce((acc, model) => {
    const filePath = `${__dirname}/models/${model}/${model}.dataloaders.js`
    if (existsSync(filePath)) {
        const loaders = require(filePath).default
        if (loaders) {
            Object.entries(loaders).forEach(([k, op]) => {
                if (k in acc) logger.error('Duplicate dataloader key', { critical: true, key: k })
                acc[k] = op
            })
        }
    }
    return acc
}, {})

const methods = dirs(`${__dirname}/methods`).reduce((acc, model) => {
    const filePath = `${__dirname}/methods/${model}/${model}.dataloaders.js`
    if (existsSync(filePath)) {
        const loaders = require(filePath).default
        if (loaders) {
            Object.entries(loaders).forEach(([k, op]) => {
                if ((k in acc) || (k in models)) logger.error('Duplicate dataloader key', { critical: true, key: k })
                acc[k] = op
            })
        }
    }
    return acc
}, {})

const dataloadersMapping = { ...models, ...methods }

export const createLoaders = (opt) => new Proxy({}, {
    get (obj, property) {
        if (!(property in obj) && (property in dataloadersMapping)) {
            obj[property] = dataloadersMapping[property](opt)
        }
        return obj[property]
    }
})
