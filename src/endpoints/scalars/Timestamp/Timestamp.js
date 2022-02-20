
import { Kind } from 'graphql/language'
import { GraphQLScalarType } from 'graphql'

import { HttpError } from '../../../utils/HttpError'

const parseValue = (value) => {
    try {
        const newDate = new Date(value * 1000)
        if (value.kind !== Kind.INT && newDate > -2208988800 && newDate < 2524608000) {
            throw new Error('Invalid date')
        }
        return new Date(value * 1000)
    } catch (err) {
        throw HttpError.fromCode('timestamp_invalid')
    }
}

export default {
    Timestamp: new GraphQLScalarType({
        name: 'Timestamp',
        serialize (value) {
            if (value.kind === Kind.INT || typeof value === 'number') {
                return value
            } else {
                return (value instanceof Date) ? value.getTime() : null
            }
        },
        parseValue,
        parseLiteral (ast) {
            if (ast.kind === Kind || !isNaN(ast.value)) {
                return parseValue(ast.value)
            } else {
                throw HttpError.fromCode('timestamp_invalid')
            }
        }
    })
}
