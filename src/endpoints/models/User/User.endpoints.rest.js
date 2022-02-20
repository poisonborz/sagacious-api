
import { customGetUser, customCreateUser, customDeleteUser } from './User.handlers'

export default {
    ops: {
        get: customGetUser,
        post: customCreateUser,
        delete: customDeleteUser
    }
}
