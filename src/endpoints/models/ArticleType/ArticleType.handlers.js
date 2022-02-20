
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { removeUndefined } from '../../../utils/utils'
import {
    customCreateTranslation,
    customUpdateTranslation,
    formTranslationInput
} from '../Translation/Translation.handlers'
import db from '../../../utils/database'
import { HttpError } from '../../../utils/HttpError'

export const customGetArticleType = async (options) => {
    const { context } = options
    const { isAdmin, belongsToGroupId } = context.authUser

    let types = await defaultGetter({ ...options, model: models.ArticleType })

    return types.filter(type => {
        if (type.restrictedType) {
            return !!(isAdmin || type.groupId === belongsToGroupId)
        }
        return true
    })
}

export const customCreateArticleType = async (options) => {
    if (options.args.id) {
        return customUpdateArticleType(options)
    }

    if (!options.args.name || !(Object.keys(formTranslationInput(options.args.name)).length)) {
        throw HttpError.fromCode('req_articletypename')
    }

    return db.transaction(async transaction => {
        const translation = await customCreateTranslation({
            ...options,
            transaction,
            args: options.args.name
        })

        const articleCategory = await models.ArticleCategory.findOne({
            where: {
                id: options.args.inArticleCategoryId
            },
            context: options.context,
            transaction
        })

        if (!articleCategory) {
            throw models.ArticleCategory.authError()
        }

        const articleType = await models.ArticleType.create(
            removeUndefined({
                groupId: options.args.groupId || options.context.ownGroup.id,
                inArticleCategoryId: options.args.inArticleCategoryId,
                nameId: translation.id,
            }),
            { ...options, transaction }
        )
        if (!articleType) {
            throw models.ArticleType.authError()
        }
        return articleType
    })
}

export const customUpdateArticleType = async (options) => {
    const articleType = await models.ArticleType.findOne({
        context: options.context,
        where: {
            id: options.args.id
        }
    })
    if (!articleType) {
        throw models.ArticleType.authError()
    }
    return db.transaction(async transaction => {

        if (options.args.name) {
            const updatedName = formTranslationInput(options.args.name)

            // check if the name needs to be updated
            if (Object.keys(updatedName).length) {
                await customUpdateTranslation({
                    ...options,
                    args: {
                        id: articleType.nameId,
                        ...updatedName
                    },
                    transaction
                })
            }
        }

        if (options.args.inArticleCategoryId) {
            const articleCategory = await models.ArticleCategory.findOne({
                where: {
                    id: options.args.inArticleCategoryId
                },
                context: options.context,
                transaction
            })

            if (!articleCategory) {
                throw models.ArticleCategory.authError()
            }

            const articles = await models.Article.findAll({
                where: {
                    articleTypeId: articleType.id
                },
                groupAffiliationHandled: true,
                context: options.context,
                transaction
            })

            await Promise.all(articles.map(async article => {
                article.articleCategoryId = articleCategory.id
                return article.save({ ...options, transaction })
            }))
        }

        return articleType.update(removeUndefined({
            inArticleCategoryId: options.args.inArticleCategoryId,
            groupId: options.args.groupId,
            image: options.args.image,
        }),
        { ...options, transaction })
    })
}

export const customDeleteArticleType = async (options) => {
    const articleType = await models.ArticleType.findOne({
        ...options,
        where: {
            id: options.args.id
        }
    })
    if (!articleType) {
        throw models.ArticleType.authError()
    }
    return db.transaction(async transaction => {
        const name = await articleType.getName(options)
        if (name) {
            return name.destroy({ ...options, transaction })
        }

        const articles = await articleType.getArticles({ ...options, groupAffiliationHandled: true })
        if (articles.length) {
            throw HttpError.fromCode('cant_delete_articletype_articles')
        }

        return Boolean(await articleType.destroy({ ...options, transaction }))
    })
}

