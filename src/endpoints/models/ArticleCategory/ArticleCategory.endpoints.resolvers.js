
import {
    customGetArticleCategory,
    customCreateArticleCategory,
    customUpdateArticleCategory,
    customDeleteArticleCategory
} from './ArticleCategory.handlers'
import { createLocalTransientFile } from '../../../utils/transientFile'
import handleItemImage from '../../../utils/itemImage'

export default {

    Query: {
        articleCategory (root, args, context) {
            return customGetArticleCategory({ root, args, context })
        }
    },

    Mutation: {
        async createArticleCategory (root, args, context) {
            const result = await customCreateArticleCategory({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateArticleCategory (root, args, context) {
            const result = await customUpdateArticleCategory({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async deleteArticleCategory (root, args, context) {
            const result = await customDeleteArticleCategory({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateArticleCategoryImage (root, { id, file }, context) {
            const { createReadStream, filename } = await file
            const articleCategory = await context.loaders.articleCategory.load(id)
            const readStream = createReadStream()
            if (articleCategory) {
                const transientImageFileName = await createLocalTransientFile(readStream, filename)
                const imageUrl = await handleItemImage({
                    transientImageFileName,
                    imageSize: 700,
                    existingImageUrl: articleCategory.image,
                    itemId: context.authUser.id,
                    imageCategory: 'articleCategories'
                })
                return customUpdateArticleCategory({ args: { id: id, image: imageUrl }, context })
            }
        }
    },

    ArticleCategory: {
        name (root, args, context) {
            if (root.nameId) {
                return context.loaders.translation.load(root.nameId)
            }
        },
        group (root, args, context) {
            if (root.groupId) {
                return context.loaders.group.load(root.groupId)
            }
        }
    }
}
