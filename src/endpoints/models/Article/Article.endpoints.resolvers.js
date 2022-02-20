
import {
    customGetArticle,
    customCreateArticle,
    customUpdateArticle,
    customDeleteArticle,
    getArticleAssignedGroup,
} from './Article.handlers'
import { createLocalTransientFile } from '../../../utils/transientFile'
import handleItemImage from '../../../utils/itemImage'

export default {
    Query: {
        article (root, args, context) {
            return customGetArticle({ root, args, context })
        }
    },

    Mutation: {
        async createArticle (root, args, context) {
            const result = (await customCreateArticle({ root, args, context }) || [])
            return Array.isArray(result) ? result : [result]
        },
        async updateArticle (root, args, context) {
            const result = (await customUpdateArticle({ root, args, context }) || [])
            return Array.isArray(result) ? result : [result]
        },
        async deleteArticle (root, args, context) {
            const result = (await customDeleteArticle({ root, args, context }) || [])
            return Array.isArray(result) ? result : [result]
        },
        async updateArticleImage (root, { id, file }, context) {
            const { createReadStream, filename } = await file
            const article = await context.loaders.article.load(id)
            const readStream = createReadStream()
            if (article) {
                const transientImageFileName = await createLocalTransientFile(readStream, filename)
                const image = await handleItemImage({
                    transientImageFileName,
                    imageSize: 700,
                    existingImageUrl: article.image,
                    itemId: context.authUser.id,
                    imageCategory: 'articles'
                })
                return article.update({ image })
            }
        }
    },
    Article: {

        createdByGroup (root, args, context) {
            if (root.createdByGroupId) {
                return context.loaders.group.load(root.createdByGroupId)
            }
        },

        description (root, args, context) {
            if (root.descriptionId) {
                return context.loaders.translation.load(root.descriptionId)
            }
        },

        articleType (root, args, context) {
            if (root.articleTypeId) {
                return context.loaders.articleTypeInsecure.load(root.articleTypeId)
            }
        },

        articleCategory (root, args, context) {
            if (root.articleCategoryId) {
                return context.loaders.articleCategoryInsecure.load(root.articleCategoryId)
            }
        },

        assignedToGroup (root, args, context) {
            return getArticleAssignedGroup({ root, args, context })
        },

        async assignedToGroupId (root, args, context) {
            return (await getArticleAssignedGroup({ root, args, context }) || {}).id
        },

        async relatedGroups (root, args, context) {
            const groups = await context.loaders.relatedGroups.load(root.id)

            const validGroups = []

            for (const groupInd in groups) {
                const groupItem = await groups[groupInd]

                if (groupItem && !!groupItem.name) {
                    validGroups.push(groupItem)
                }
            }

            return validGroups
        },
    }
}

