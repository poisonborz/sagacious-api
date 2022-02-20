
import Sequelize from 'sequelize'

import db from '../../../utils/database'
import models from '..'

const Op = Sequelize.Op

class Article extends Sequelize.Model {
    // article specific methods
}

Article.init({
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    serial: {
        type: Sequelize.STRING(25),
        allowNull: false
    },
    descriptionId: {
        type: Sequelize.INTEGER(11)
    },
    createdByGroupId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    articleTypeId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    articleCategoryId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    image: {
        type: Sequelize.STRING(150)
    },
    created: {
        type: Sequelize.DATE
    },
    updated: {
        type: Sequelize.DATE
    },
    deleted: {
        type: Sequelize.DATE
    }
},
{
    hooks: {
        beforeFind: async options => {
            options.where = {
                [Op.and]: {
                    [Op.and]: {
                        ...options.where
                    },
                    deleted: null
                }
            }
            if (options.showDeleted) {
                delete options.where[Op.and].deleted
            }
            return options
        }
    },
    sequelize: db
})

Article.checkGroupAffiliation = (options) => {
    const ids = options.context.usersGroupsIds
    options.groupAffiliationHandled = true
    options.include = [
        ...(options.include || []),
        {
            model: models.ArticleToGroupAssignment,
            as: 'AssignedGroup',
            where: {
                groupId: {
                    [Op.in]: ids
                }
            }
        }
    ]
    return options
}

export default Article
