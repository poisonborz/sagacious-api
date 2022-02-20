
import Sequelize from 'sequelize'

import db from '../../../utils/database'
import models from '..'
import { checkDestroyOperationIsAllowed } from '../../../utils/utils'

const Op = Sequelize.Op

const checkGroupBeforeInsertUpdate = async (articleType, options) => {
    if (options.context.usersGroups.find(g => articleType.groupId === g.id)) {
        const articleCategory = await models.ArticleCategory.findOne({
            where: {
                id: articleType.inArticleCategoryId
            },
            context: options.context
        })

        if (!articleCategory) {
            throw models.ArticleType.authError()
        }

        return articleType
    } else {
        throw models.ArticleType.authError()
    }
}

const ArticleType = db.define('ArticleType', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nameId: {
        type: Sequelize.STRING(100)
    },
    groupId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    inArticleCategoryId: {
        type: Sequelize.INTEGER(11)

    },
    image: {
        type: Sequelize.STRING(150)
    },
    created: {
        type: Sequelize.DATE
    },
    updated: {
        type: Sequelize.DATE
    }
},
{
    hooks: {
        beforeCreate: async (articleType, options) => {
            articleType = checkGroupBeforeInsertUpdate(articleType, options)
            return articleType
        },
        beforeUpdate: async (articleType, options) => {
            articleType = checkGroupBeforeInsertUpdate(articleType, options)
            return articleType
        },
        beforeUpsert: async (articleType, options) => {
            articleType = checkGroupBeforeInsertUpdate(articleType, options)
            return articleType
        },
        beforeDestroy: async (articleType, options) => {
            checkDestroyOperationIsAllowed(articleType.groupId, options, false)
            return articleType
        }
    }
})

ArticleType.checkGroupAffiliation = (options) => {
    options.groupAffiliationHandled = true

    options.where = {
        [Op.and]: {
            [Op.and]: {
                ...options.where
            },
            groupId: {
                [Op.in]: options.context.groupsInTree
            }
        }
    }

    return options
}

export default ArticleType
