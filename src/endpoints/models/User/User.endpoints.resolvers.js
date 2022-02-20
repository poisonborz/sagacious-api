
import { customGetUser, customCreateUser, customUpdateUser, customDeleteUser } from './User.handlers'
import { createLocalTransientFile } from '../../../utils/transientFile'
import handleItemImage from '../../../utils/itemImage'

export default {
    Query: {
        async user (root, args, context) {
            return customGetUser({ root, args, context })
        }
    },
    Mutation: {
        async createUser (root, args, context) {
            const result = await customCreateUser({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateUser (root, args, context) {
            const result = await customUpdateUser({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async deleteUser (root, args, context) {
            const result = await customDeleteUser({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateUserImage (root, { id, file }, context) {
            const { createReadStream, filename } = await file
            const user = await customGetUser({ root, args: { id }, context })
            const readStream = createReadStream()
            if (user.length === 1) {
                const transientImageFileName = await createLocalTransientFile(readStream, filename)
                const imageUrl = await handleItemImage({
                    transientImageFileName,
                    imageSize: 500,
                    existingImageUrl: user.image,
                    itemId: context.authUser.id,
                    imageCategory: 'users'
                })
                return customUpdateUser({ args: { id, image: imageUrl }, context })
            }
        }
    },
    User: {
        role (root, args, context) {
            return root.getRole({ context })
        },
        belongsToGroup (root, args, context) {
            return root.getGroup({ root, args, context })
        }
    }
}
