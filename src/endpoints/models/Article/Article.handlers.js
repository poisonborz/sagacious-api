
import Sequelize from 'sequelize'
import models from '../index'

import db from '../../../utils/database'
import { HttpError } from '../../../utils/HttpError.js'
import { arrayfy, removeUndefined, checkDestroyOperationIsAllowed } from '../../..//utils/utils'
import { customCreateTranslation, formTranslationInput } from '../Translation/Translation.handlers'


const Op = Sequelize.Op

export const customGetArticle = async (options) => {
    const { args, context } = options
    const { isAdmin, belongsToGroupId } = context.authUser

    const restrictedTypes = await models.ArticleType.findAll({
        ...options,
        where: {
            restrictedType: 1
        }
    })
    const restrictedTypesArray = restrictedTypes.map(type => type.id)

    const where = removeUndefined({
        id: args.id ? arrayfy(args.id) : undefined,
        serial: args.serial ? arrayfy(args.serial) : undefined
    })

    const filterArticlesByMake = async articles => {
        if (!args.make) return articles

        const makes = await context.loaders.articleTypeByMake.load(args.make)
        const articleTypeIdsFromMakes = makes.map(item => item.id)

        return articles.filter(item => articleTypeIdsFromMakes.includes(item.articleTypeId))
    }

    const filterArticlesByRestrictedTypes = async articles => {
        return articles.filter(article => {
            if (restrictedTypesArray.includes(article.articleTypeId)) {
                return !!(isAdmin ||
                     article.createdByGroupId === belongsToGroupId ||
                     article.assignedToGroup === belongsToGroupId)
            }
            return true
        })
    }

    const filterArticlesByIMEI = async articles => {
        if (!args.imei) return articles

        const IMEIs = arrayfy(args.imei)

        await Promise.all(articles.map(async article => {

            article.imei = await article.getIMEI(context)
        }))

        return articles.filter(article => article.imei && IMEIs.includes(article.imei))
    }

    return models.Article.findAll({ where, context })
        .then(filterArticlesByRestrictedTypes)
        .then(filterArticlesByMake)
        .then(filterArticlesByIMEI)
}

export const customCreateArticle = async (options) => {

    if (options.args.id) {
        return customUpdateArticle(options)
    }

    if (!options.args.serial) {
        throw HttpError.fromCode('serial_missing')
    }

    if (!options.args.articleTypeId) {
        throw HttpError.fromCode('type_missing')
    }

    await checkMultipleSerials(options)

    return db.transaction(async transaction => {
        let description
        options.transaction = options.transaction || transaction

        if (options.args.description) {
            description = await customCreateTranslation({
                ...options,
                args: options.args.description
            })
        }

        const articleType = await models.ArticleType.findOne({
            where: {
                id: options.args.articleTypeId
            },
            context: options.context
        })

        if (!articleType) {
            throw models.ArticleType.authError()
        }

        options.args.articleCategoryId = articleType.inArticleCategoryId

        const article = await models.Article.create(
            removeUndefined({
                articleTypeId: options.args.articleTypeId,
                createdByGroupId: options.context.ownGroup.id,
                serial: options.args.serial,
                articleCategoryId: options.args.articleCategoryId,
                descriptionId: description ? description.id : undefined
            }),
            {
                ...options,
                groupAffiliationHandled: true
            }
        )

        await Promise.all([
            (async () => {
                let groupId = options.args.assignedToGroupId || options.context.ownGroup.id
                await models.ArticleToGroupAssignment.create(
                    removeUndefined({
                        articleId: article.id,
                        groupId: groupId,
                        assignmentDepth: 0 // the creator of the article will allways be in 0 depth
                    }),
                    {
                        ...options,
                        groupAffiliationHandled: true
                    }
                )
            })()
        ])

        return article

    }, options)
}

async function checkMultipleSerials (options) {
    const { id, serial, articleTypeId } = options.args
    const where = {
        [Op.and]: {
            serial,
            articleTypeId
        }
    }

    if (id) {
        where[Op.and].id = {
            [Op.not]: id
        }
    }

    const multipleSerial = await models.Article.findAll({ ...options, where })

    if (multipleSerial.length) {
        throw HttpError.fromCode('same_type_and_serial')
    }
}

export const customDeleteArticle = async (options) => {
    const article = await models.Article.findOne({
        ...options,
        where: {
            id: options.args.id
        }
    })

    if (!article) {
        throw HttpError.fromCode('article_missing')
    }

    checkDestroyOperationIsAllowed(article.createdByGroupId, options, false)

    return db.transaction(async transaction => {
        options.transaction = options.transaction || transaction

        return Promise.all([
            // mark article as deleted
            (async () => {
                // currently it's the only operation with no physical deletion
                article.deleted = new Date().getTime()
                return !!await article.save({ ...options })
            })()

        ]).then(res => res[res.length - 1]) // last item holds the query result

    })
}

export const customUpdateArticle = async (options) => {
    const { args } = options
    const serial = args.serial.toString().trim()
    const { articleTypeId } = args

    const article = await models.Article.findOne({
        ...options,
        where: {
            id: options.args.id
        }
    })

    if (serial !== article.serial || articleTypeId !== article.articleTypeId) {
        await checkMultipleSerials(options)
    }

    if (!article) {
        throw models.Article.authError()
    } else {

        const args = removeUndefined({
            articleTypeId,
            serial,
            image: options.args.image,
            articleCategoryId: options.args.articleCategoryId,
            description: options.args.description,
            assignedToGroupId: options.args.assignedToGroupId,
            assignmentDepth: options.args.assignmentDepth,
        })

        return db.transaction(async transaction => {

            options.transaction = options.transaction || transaction

            if (args.assignedToGroupId) {
                let groupId = options.args.assignedToGroupId || options.context.ownGroup.id
                const groupAssignment = await models.ArticleToGroupAssignment.findOne({
                    where: {
                        [Op.and]: {
                            articleId: article.id,
                            assignmentDepth: 0
                        }
                    },
                    ...options
                })

                if (groupAssignment) {
                    groupAssignment.groupId = groupId
                    await groupAssignment.save(options)
                } else {
                    await models.ArticleToGroupAssignment.create(
                        removeUndefined({
                            articleId: article.id,
                            groupId: groupId,
                            assignmentDepth: 0
                        }),
                        {
                            ...options,
                            groupAffiliationHandled: true
                        }
                    )
                }
            }

            if (args.description) {
                const updatedDescr = formTranslationInput(args.description)

                if (Object.keys(updatedDescr).length) {
                    const updatedDescription = await customCreateTranslation({
                        ...options,
                        args: {
                            id: article.descriptionId,
                            ...updatedDescr
                        }
                    })
                    args.descriptionId = updatedDescription.id
                }
            }

            if (args.articleTypeId) {
                const articleType = await models.ArticleType.findOne({
                    where: {
                        id: args.articleTypeId
                    },
                    ...options
                })

                if (!articleType) {
                    throw models.ArticleType.authError()
                }

                args.articleCategoryId = articleType.inArticleCategoryId
            }

            return article.update(removeUndefined({
                articleTypeId: args.articleTypeId,
                articleCategoryId: args.articleCategoryId,
                serial: args.serial,
                assignedToGroupId: args.assignedToGroupId,
                image: args.image,
                descriptionId: args.descriptionId
            }),
            {
                ...options,
                transaction
            }
            ).then(async res => {
                return res
            })
        })
    }
}

export const getArticleAssignedGroup = async (options) => {
    return options.context.loaders.articleToGroupAssignment
        .load(options.root.id)
        .then(result => {
            const articleAssignedToGroup = result.find(atga => options.context.usersGroupsIds.includes(atga.groupId))
            return options.context.loaders.group.load(articleAssignedToGroup.groupId)
        })
}
