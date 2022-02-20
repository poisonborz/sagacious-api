
import Sequelize from 'sequelize'
import ua from 'universal-analytics'

import models from '../endpoints/models'
import { HttpError } from './HttpError'
import { getAllGroups } from '../endpoints/models/Group/Group.handlers'
import { createLoaders } from '../endpoints/dataloaders'

const Op = Sequelize.Op

export const buildContext = async (req, userId, customCurrentGroup = 0) => {

    const localContext = {
        authUser: {
            id: userId
        }
    }

    const user = await models.User.findOne({
        where: {
            id: userId
        },
        includeAdmin: true,
        context: localContext,
        groupAffiliationHandled: true,
        single: true
    })
    if (!user) {
        throw HttpError.fromCode('invalid_token')
    }

    const userBelongsToGroup = await models.Group.findAll({
        where: {
            id: {
                [Op.in]: [user.belongsToGroupId, customCurrentGroup]
            }
        },
        groupAffiliationHandled: true,
        context: localContext
    })

    userBelongsToGroup.sort(sortGroup)

    if (
        userBelongsToGroup.length > 1 &&
        (
            (
                userBelongsToGroup[1].rootGroupId !== userBelongsToGroup[0].rootGroupId &&
                userBelongsToGroup[1].rootGroupId !== userBelongsToGroup[0].id
            ) ||
            (
                userBelongsToGroup[0].isRoot &&
                userBelongsToGroup[1].isRoot &&
                userBelongsToGroup[0].id !== userBelongsToGroup[1].id
            )
        )
    ) {
        customCurrentGroup = user.belongsToGroupId
    }


    let usersGroups = await getAllGroups({
        context: localContext,
        id: [customCurrentGroup || user.belongsToGroupId],
        groupAffiliationHandled: true
    })

    let nonCustomUserGroups = usersGroups
    if (customCurrentGroup && customCurrentGroup !== user.belongsToGroupId) {
        nonCustomUserGroups = await getAllGroups({
            context: localContext,
            id: [user.belongsToGroupId],
            groupAffiliationHandled: true
        })
    }

    usersGroups.sort(sortGroup)
    nonCustomUserGroups.sort(sortGroup)

    const ownGroup = usersGroups.find(g => g.id === customCurrentGroup || g.id === user.belongsToGroupId)

    const role = await user.getRole({ context: { ...localContext, usersGroups }, single: true })

    const usersGroupsIds = usersGroups.map(g => g.id)
    const nonCustomUsersGroupsIds = nonCustomUserGroups.map(g => g.id)

    let groupsInTree = []

    if (ownGroup.isRoot) {
        groupsInTree = [...usersGroupsIds]
    } else {
        groupsInTree = (await getAllGroups({
            context: localContext,
            id: [ownGroup.rootGroupId],
            groupAffiliationHandled: true
        })).map(g => g.id)
    }

    user.role = role

    let trackingUser
    if (process.env.ANALYTICS_KEY) {
        trackingUser = ua(process.env.ANALYTICS_KEY, user.email, {
            uid: user.email,
            strictCidFormat: false })
    }

    const context = {
        authUser: user,
        ownGroup,
        usersGroups,
        usersGroupsIds,
        groupsInTree,
        trackingUser,
        customAnalyticsKey: req.headers['x-analytics-key'] ? req.headers['x-analytics-key'].toUpperCase() : null,
        loaders: null,
        customCurrentGroup,
        nonCustomUsersGroupsIds,
        // If you are sure the groups are not changing
        // during the request you can get them from the context.
        // These groups were calculated for `user.belongsToGroupId`
        __allGroups: nonCustomUserGroups
    }

    context.loaders = createLoaders({ context, args: {} })

    return context
}

function sortGroup (groupA, groupB) {
    if (groupA.isRoot || groupA.id === groupB.parentGroupId) {
        return -1
    } else if (groupB.isRoot || groupB.id === groupA.parentGroupId) {
        return 1
    } else {
        return 0
    }
}
