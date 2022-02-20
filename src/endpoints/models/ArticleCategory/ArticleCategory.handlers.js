
import db from '../../../utils/database'
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { removeUndefined } from '../../../utils/utils'
import { HttpError } from '../../../utils/HttpError'
import {
    customCreateTranslation,
    customUpdateTranslation, formTranslationInput
} from '../Translation/Translation.handlers'


export const customGetArticleCategory = async (options) => {
    const { context } = options
    const { isAdmin } = context.authUser
    const { id } = context.ownGroup

    const articleCategories = await defaultGetter({ ...options, model: models.ArticleCategory })

    return articleCategories.filter(category => {
        if (category.restrictedType) {
            return !!(isAdmin || category.groupId === id)
        }

        return true
    })
}

export const customCreateArticleCategory = async (options) => {
    if (options.args.id) {
        return customUpdateArticleCategory(options)
    }

    if (!options.args.name || !(Object.keys(formTranslationInput(options.args.name)).length)) {
        throw HttpError.fromCode('req_articlecatname')
    }

    return db.transaction(async transaction => {
        const translation = await customCreateTranslation({
            ...options,
            args: options.args.name,
            transaction
        })

        const articleCategory = await models.ArticleCategory.create(
            removeUndefined({
                groupId: options.args.groupId || options.context.ownGroup.id,
                nameId: translation.id
            }),
            { ...options, transaction }
        )
        if (!articleCategory) {
            throw models.ArticleCategory.authError()
        }
        return articleCategory
    })
}

export const customUpdateArticleCategory = async (options) => {
    const articleCategory = await models.ArticleCategory.findOne({
        context: options.context,
        where: {
            id: options.args.id
        }
    })
    if (articleCategory) {
        return db.transaction(async transaction => {
            if (options.args.name) {
                const nameUpdate = formTranslationInput(options.args.name)

                // check if the name needs to be updated
                if (Object.keys(nameUpdate).length) {
                    await customUpdateTranslation({
                        ...options,
                        args: {
                            id: articleCategory.nameId,
                            ...nameUpdate
                        },
                        transaction
                    })
                }
            }

            return articleCategory.update(removeUndefined({
                groupId: options.args.groupId,
                image: options.args.image,
            }),
            { ...options, transaction })
        })
    } else {
        throw models.ArticleCategory.authError()
    }
}

export const customDeleteArticleCategory = async (options) => {
    const articleCategory = await models.ArticleCategory.findOne({
        ...options,
        where: {
            id: options.args.id
        }
    })
    if (articleCategory) {
        return db.transaction(async transaction => {
            const name = await articleCategory.getName(options)
            if (name) {
                name.destroy({ ...options, transaction })
            }

            const articleTypes = await articleCategory.getArticleTypes({ ...options, groupAffiliationHandled: true })
            if (articleTypes.length) {
                throw HttpError.fromCode('cant_delete_articlecat_types')
            }

            const articles = await articleCategory.getArticles({ ...options, groupAffiliationHandled: true })
            if (articles.length) {
                throw HttpError.fromCode('cant_delete_articlecat_articles')
            }

            const elem = await articleCategory.destroy({ ...options, transaction })
            return Boolean(elem)
        })
    } else {
        throw models.ArticleCategory.authError()
    }
}
