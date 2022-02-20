
import {
    customGetGroup,
    customCreateGroup,
    customUpdateGroup,
    customDeleteGroup
} from './Group.handlers'
import { createLocalTransientFile } from '../../../utils/transientFile'
import handleItemImage from '../../../utils/itemImage'

export default {
    Query: {
        group (root, args, context) {
            return customGetGroup({ root, args, context })
        }
    },
    Mutation: {
        async createGroup (root, args, context) {
            const result = await customCreateGroup({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateGroup (root, args, context) {
            const result = await customUpdateGroup({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async deleteGroup (root, args, context) {
            const result = await customDeleteGroup({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateGroupImage (root, { id, file }, context) {
            const { createReadStream, filename } = await file
            const group = await customGetGroup({ root, args: { id }, context })
            const readStream = createReadStream()
            if (group.length === 1) {
                const transientImageFileName = await createLocalTransientFile(readStream, filename)
                const imageUrl = await handleItemImage({
                    transientImageFileName,
                    imageSize: 700,
                    existingImageUrl: group[0].image,
                    itemId: context.authUser.id,
                    imageCategory: 'groups'
                })
                return customUpdateGroup({ args: { id, image: imageUrl }, context })
            }
        }
    },

    Group: {
        childGroups (root, args, context) {
            return root.getChildGroups({ context })
        },

        async childGroupIds (root, args, context) {
            return ((await root.getChildGroups({ context })) || []).map(item => item.id)
        },

        async parentGroup (root, args, context) {
            // allow to see parent group details if requested group is not root
            if (!context.usersGroups[0].isRoot) {
                context.usersGroupsIds.push(context.usersGroups[0].parentGroupId)
            }

            return root.parentGroupId ? context.loaders.group.load(root.parentGroupId) : null
        },

        async rootGroupName (root, args, context) {
            // allow to see root group details if requested group is not root
            if (!root.isRoot) {
                const rootGroup = await context.loaders.groupUnsafe.load(root.rootGroupId)

                return rootGroup ? rootGroup.name : null
            }
        },

        async roleIds (root, args, context) {
            return ((await root.getRoles({ context })) || []).map(item => item.id)
        },

        roles (root, args, context) {
            return root.getRoles({ context })
        },
        async userIds (root, args, context) {
            return ((await root.getUsers({ context })) || []).map(item => item.id)
        },

        users (root, args, context) {
            return root.getUsers({ context })
        },

        async articleIds (root, args, context) {
            return ((await root.getArticles({ context })) || []).map(item => item.id)
        },

        articles (root, args, context) {
            return root.getArticles({ context })
        }

    }
}
