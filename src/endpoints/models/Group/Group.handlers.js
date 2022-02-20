
import Sequelize from 'sequelize'
import DataLoader from 'dataloader'

import models from '../index'
import db from '../../../utils/database'
import { defaultGetter } from '../../../utils/queryUtils'
import { removeUndefined } from '../../../utils/utils'
import { groupsByIds, groupsByParentIds } from './Group.dataloaders'
import { HttpError } from '../../../utils/HttpError'

const Op = Sequelize.Op

export const getAllGroups = async (options) => {
    if (!options.id) {
        options.args = { id: options.context.groupsInTree }
        options.groupAffiliationHandled = true
        const groups = await customGetGroup(options)

        return groupDescendentsFrom(groups, [options.context.authUser.belongsToGroupId])
    }

    let groupLoader, groupByParentLoader
    const unsafe = options.groupAffiliationHandled
    if (options.context && options.context.loaders) {
        groupLoader = options.context.loaders[unsafe ? 'groupUnsafe' : 'group']
        groupByParentLoader = options.context.loaders[unsafe ? 'groupByParentUnsafe' : 'groupByParent']
    } else {
        // It doesn't make sense to use a dataloader on context creation.
        // After this function they are destroyed, so a `Group.findAll` is enough.
        // The only reason they are here is to have the same interface to use after
        // this block also when loaders are in the context.
        groupLoader = new DataLoader(keys => groupsByIds(options, keys, unsafe))
        groupByParentLoader = new DataLoader(keys => groupsByParentIds(options, keys, unsafe))
    }

    const allGroups = await groupLoader.loadMany(options.id)

    while (options.id.length) {
        let childGroups = await groupByParentLoader.loadMany(options.id)
        childGroups = childGroups.flat().filter(Boolean)
        options.id = childGroups.map(group => group.id)
        allGroups.push(...childGroups)
    }

    return allGroups
}

const groupDescendentsFrom = (groups, rootGroupIds) => {
    if (!(Array.isArray(rootGroupIds) && rootGroupIds.length)) return groups

    // group entry can be null
    groups = groups.filter(g => !!g)

    const descendants = [...groups.filter(g => rootGroupIds.includes(g.id))]

    let childGroups = groups.filter(g => rootGroupIds.includes(g.parentGroupId))

    while (childGroups.length) {
        descendants.push(...childGroups)
        const childGroupIds = [...childGroups].map(g => g.id)
        childGroups = groups.filter(g => childGroupIds.includes(g.parentGroupId))
    }

    const distantGroups = []

    descendants.forEach(group => {
        if (!distantGroups.find(g => g.id === group.id)) {
            distantGroups.push(group)
        }
    })

    return distantGroups
}

const getRelatedArticleIds = async (options) => {
    options.groupAffiliationHandled = true
    const articles = await models.Article.findAll({
        include: {
            model: models.ArticleToGroupAssignment,
            as: 'AssignedGroup',
            where: {
                groupId: {
                    [Op.in]: options.context.usersGroupsIds
                }
            },
            groupAffiliationHandled: true,
            context: options.context
        },
        groupAffiliationHandled: true,
        context: options.context
    })
    return articles.map(a => a.id)
}

export const customGetGroup = async (options) => {

    if (options.args.getAll) {
        return getAllGroups({
            context: options.context,
            groupAffiliationHandled: true
        })

    } else if (options.args.getAllChildren) {

        return options.context.usersGroups

    } else if (options.args.id) {

        return defaultGetter({
            ...options, model: models.Group
        })

    } else if (options.args.related) {
        return models.Group.findAll({
            include: {
                model: models.ArticleToGroupAssignment,
                as: 'relatedGroup',
                where: {
                    [Op.and]: {
                        groupId: {
                            [Op.notIn]: options.context.usersGroupsIds
                        },
                        articleId: {
                            [Op.in]: await getRelatedArticleIds(options)
                        }
                    }
                },
                groupAffiliationHandled: true,
                context: options.context
            },
            groupAffiliationHandled: true,
            context: options.context
        })
    } else {
        return models.Group.findAll({
            ...options,
            where: {
                [Op.or]: {
                    parentGroupId: options.context.ownGroup.id,
                    id: options.context.ownGroup.id
                }
            }
        })
    }
}

const createUpdateGroup = (options, op, groupProps) => {
    return db.transaction(async transaction => {
        options.transaction = options.transaction || transaction

        return op[0][op[1]](
            removeUndefined(groupProps),
            options
        )
    })
}

const validateGroupInputs = args => {
    if (args.name !== undefined && args.name.toString().trim().length < 1) {
        throw HttpError.fromCode('group_name_required')
    }

    return true
}

export const customCreateGroup = async (options) => {
    if (options.args.id) {
        return customUpdateGroup(options)
    }

    validateGroupInputs(options.args)

    if (options.args.parentGroupId) {
        return createUpdateGroup(
            options,
            [models.Group, 'create'],
            {
                parentGroupId: options.args.parentGroupId,
                name: options.args.name
            })
    }

}

export const customUpdateGroup = async (options) => {
    validateGroupInputs(options.args)

    const groups = await getAllGroups({
        id: [options.args.id],
        context: options.context
    })
    const group = groups.find(gp => gp.id === options.args.id)
    const ids = groups.map(gp => gp.id)

    if (options.args.parentGroupId && ids.includes(+options.args.parentGroupId)) {
        throw HttpError.fromCode('group_selfparent')
    }

    if (group) {
        const parentGroup = await models.Group.findByPk(
            options.args.parentGroupId || group.parentGroupId,
            { ...options }
        )

        return createUpdateGroup(
            options,
            [group, 'update'],
            {
                parentGroupId: options.args.parentGroupId,
                name: options.args.name,
                image: options.args.image,
                groupTypeId: options.args.groupTypeId,
            })

    } else {
        throw models.Group.authError()
    }
}

export const customDeleteGroup = async (options) => {
    const groups = await getAllGroups({
        id: [options.args.id],
        context: options.context
    })

    if (groups.length === 1) {
        const group = groups[0]
        const articles = await group.getArticles({ ...options })
        const users = await group.getUsers({ ...options })

        if (articles.length) {
            throw HttpError.fromCode('group_delarticles')
        }

        if (users.length) {
            throw HttpError.fromCode('group_delusers')
        }

        if (group.isRoot) {
            throw HttpError.fromCode('group_noop')
        }


        throw HttpError.fromCode('permission_error')
    } else {
        throw HttpError.fromCode('group_delchildren')
    }
}
