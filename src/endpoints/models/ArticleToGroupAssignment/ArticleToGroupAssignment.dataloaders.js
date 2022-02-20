
import DataLoader from 'dataloader'
import { Sequelize } from 'sequelize'

import models from '../index'
import { sortFillAndGroup } from '../../../utils/DataLoader'

const Op = Sequelize.Op

export const groupAssignmentsByArticleIds = async (options, articleIds) => {
    const articleToGroupAssignment = await models.ArticleToGroupAssignment.findAll({
        where: {
            articleId: {
                [Op.in]: articleIds
            }
        },
        ...options
    })

    return sortFillAndGroup(articleToGroupAssignment, articleIds, 'articleId')
}

export default {
    articleToGroupAssignment: opt => new DataLoader(keys => groupAssignmentsByArticleIds(opt, keys)),
    articleToGroupAssignmentInsecure: opt => new DataLoader(keys => groupAssignmentsByArticleIds(
        { ...opt, groupAffiliationHandled: true },
        keys
    ))
}
