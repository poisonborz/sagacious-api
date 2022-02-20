
import { Kind } from 'graphql/language'
import { GraphQLScalarType } from 'graphql'

const stringIsValidJSON = (value) => {
    if (/^[\],:{}\s]*$/.test(value.replace(/\\["\\bfnrtu]/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        return true
    }
}

export default {
    JSON: new GraphQLScalarType({
        name: 'JSON',
        serialize (value) {
            if (typeof value === 'string') {
                if (stringIsValidJSON(value)) {
                    return value
                } else {
                    throw new Error('Invalid JSON')
                }
            } else {
                return JSON.stringify(value)
            }
        },
        parseValue (value) {
            try {
                return JSON.parse(value)
            } catch (err) {
                throw new Error('Invalid JSON')
            }
        },
        parseLiteral (ast) {
            if (ast.kind === Kind.STRING && stringIsValidJSON(ast.value)) {
                return JSON.parse(ast.value)
            } else {
                throw new Error('Invalid JSON')
            }
        }
    })
}
