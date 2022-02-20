
import { GraphQLScalarType } from 'graphql'
import Hashids from 'hashids'
import dotenv from 'dotenv'

import { getSecret } from '../../../utils/secrets'
import logger from '../../../utils/logger'

dotenv.config()

export const HASH_SECRET = process.env.HASH_SECRET || getSecret(process.env.HASH_SECRET_FILE)

if (!HASH_SECRET) {
    logger.error('No hash secret found', { critical: true })
}

const hash = new Hashids(HASH_SECRET, 8)

export const parseValue = (value) => {
    if (process.env.DEV_DISABLE_HASHIDS !== 'true') {
        const id = hash.decode(value)[0]
        if (id === undefined) {
            throw new Error(`Indecipherable id hash: ${value}`)
        }
        return id
    } else {
        // dev-only ids in format of 123_hA$h
        if (value !== null && value !== '') {
            const idPart = Number(value.split('_')[0])
            if (isNaN(idPart)) {
                throw new Error(`Indecipherable id hash: ${value}`)
            }
            return idPart
        } else {
            return value
        }
    }
}

export const composeValue = (value) => {
    // `hash` will encode only numbers
    // this is handy also when the id is already hashed
    if (typeof value === 'string' && !/^\d+$/.test(value)) {
        return value
    }
    if (process.env.DEV_DISABLE_HASHIDS !== 'true') {
        return hash.encode(value)
    } else {
        // dev-only ids in format of 123_hA$h
        return value !== null && value !== '' ? `${value}_${hash.encode(value)}` : null
    }
}

export default {
    HashedId: new GraphQLScalarType({
        name: 'HashedId',
        description: 'Obfuscated id for client use',
        serialize (value) {
            return composeValue(value)
        },
        parseValue,
        parseLiteral (ast) {
            return parseValue(ast.value)
        }
    })
}
