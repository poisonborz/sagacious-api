
import { customGetGroup, customCreateGroup, customDeleteGroup } from './Group.handlers'

export default {
    ops: {
        get: customGetGroup,
        post: customCreateGroup,
        delete: customDeleteGroup
    }
}
