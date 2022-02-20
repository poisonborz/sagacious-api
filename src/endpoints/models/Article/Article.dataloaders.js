
import DataLoader from 'dataloader'

import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill } from '../../../utils/DataLoader'

export const articlesByIds = async (options, ids) => {
    let articles = await defaultGetter({ ...options, args: { id: ids }, model: models.Article })
    return sortAndFill(articles, ids, 'id')
}

export const relatedGroupsByArticleIds = async (options, ids) => {
    const groupAssignmentsAll = await options.context.loaders.articleToGroupAssignmentInsecure.loadMany(ids)
    return Promise.all(groupAssignmentsAll.map(async groupAssignments => {
        return groupAssignments.map(async groupAssignment => {
            const res = (await options.context.loaders.group
                .load(groupAssignment.groupId)) || {}

            return {
                id: groupAssignment.id,
                name: res.name || null,
                depth: groupAssignment.assignmentDepth
            }
        })
    }))
}

export default {
    article: opt => new DataLoader(keys => articlesByIds(opt, keys)),
    relatedGroups: opt => new DataLoader(keys => relatedGroupsByArticleIds(opt, keys)),
}
