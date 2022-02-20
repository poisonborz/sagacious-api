
import { Sequelize } from 'sequelize'

import models from '../index'
const Op = Sequelize.Op

export const customGetArticleToGroupAssignment = async (options) => {
    const where = {
        articleId: {
            [Op.in]: options.args.id
        }
    }
    if (!options.args.id || !options.args.id.length) {
        delete where.articleId
    }
    const articleToGroupAssignment = await models.ArticleToGroupAssignment.findAll({
        where,
        ...options
    })

    return articleToGroupAssignment
}

