
import DataLoader from 'dataloader'

import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill, sortFillAndGroup } from '../../../utils/DataLoader'

export const groupsByIds = async (options, ids, unsafeLoading) => {
    let unsafeCheck = {}

    if (unsafeLoading) {
        unsafeCheck = { groupAffiliationHandled: true }
    }

    const groups = await defaultGetter({
        ...options, ...unsafeCheck, args: { id: ids }, model: models.Group
    })

    return sortAndFill(groups, ids, 'id')
}

export const groupsByParentIds = async (options, ids, unsafeLoading) => {
    let unsafeCheck = {}

    if (unsafeLoading) {
        unsafeCheck = { groupAffiliationHandled: true }
    }

    const groups = await models.Group.findAll({
        where: { parentGroupId: ids },
        ...unsafeCheck,
        ...options
    })

    return sortFillAndGroup(groups, ids, 'parentGroupId')
}

export default {
    group: opt => new DataLoader(keys => groupsByIds(opt, keys)),
    groupUnsafe: opt => new DataLoader(keys => groupsByIds(opt, keys, true)),
    groupByParent: opt => new DataLoader(keys => groupsByParentIds(opt, keys)),
    groupByParentUnsafe: opt => new DataLoader(keys => groupsByParentIds(opt, keys, true))
}
