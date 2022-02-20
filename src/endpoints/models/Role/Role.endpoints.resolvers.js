
import { customGetRole } from './Role.handlers'

export default {
    Query: {
        role (root, args, context) {
            return customGetRole({ root, args, context })
        }
    },
    Mutation: {
        createRole (root, args, context) {
            return true
        },
        updateRole (root, args, context) {
            return true
        }
    },
    Role: {
        name (root, args, context) {
            return context.loaders.translation.load(root.nameId)
        },
        ownedByGroup (root, args, context) {
            return root.getOwnedByGroup({ context })
        }
    }
}
