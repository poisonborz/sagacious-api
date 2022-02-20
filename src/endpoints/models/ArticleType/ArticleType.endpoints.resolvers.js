
import {
    customGetArticleType,
    customCreateArticleType,
    customUpdateArticleType,
    customDeleteArticleType
} from './ArticleType.handlers'
import { createLocalTransientFile } from '../../../utils/transientFile'
import handleItemImage from '../../../utils/itemImage'

export default {
    Query: {
        articleType (root, args, context) {
            return customGetArticleType({ root, args, context })
        }
    },

    Mutation: {
        async createArticleType (root, args, context) {
            const result = await customCreateArticleType({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },

        async updateArticleType (root, args, context) {
            const result = await customUpdateArticleType({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async deleteArticleType (root, args, context) {
            const result = await customDeleteArticleType({ root, args, context })
            return Array.isArray(result) ? result : [result]
        },
        async updateArticleTypeImage (root, { id, file }, context) {
            const { createReadStream, filename } = await file
            const articleType = await context.loaders.articleType.load(id)
            const readStream = createReadStream()
            if (articleType) {
                const transientImageFileName = await createLocalTransientFile(readStream, filename)
                const imageUrl = await handleItemImage({
                    transientImageFileName,
                    imageSize: 700,
                    existingImageUrl: articleType.image,
                    itemId: context.authUser.id,
                    imageCategory: 'articleTypes'
                })
                return customUpdateArticleType({ args: { id, image: imageUrl }, context })
            }
        }
    },

    ArticleType: {
        name (root, args, context) {
            if (root.nameId) {
                return context.loaders.translation.load(root.nameId)
            }
        }
    }
}
