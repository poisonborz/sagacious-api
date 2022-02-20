
import { Kind } from 'graphql/language'
import { GraphQLScalarType } from 'graphql'


const validName = string => typeof string === 'string' && !!string.replace(/\s/g, '').length

export default {
    Name: new GraphQLScalarType({
        name: 'Name',
        serialize (value) {
            if (validName(value)) {
                return value
            } else {
                throw new Error('Invalid Name')
            }
        },
        parseValue (value) {
            if (validName(value)) {
                return value
            } else {
                throw new Error('Invalid Name')
            }
        },
        parseLiteral (ast) {
            if (ast.kind === Kind.STRING && validName(ast.value)) {
                return ast.value
            } else {
                throw new Error('Invalid Name')
            }
        }
    })
}
