
import Sequelize from 'sequelize'
import db from '../../../utils/database'
import models from '..'
import { checkDestroyOperationIsAllowed } from '../../../utils/utils'
const Op = Sequelize.Op

const checkGroupBeforeInsertUpdate = async (articleCategory, options) => {
    if (options.context.usersGroups.find(g => articleCategory.groupId === g.id)) {
        return articleCategory
    } else {
        throw models.ArticleCategory.authError()
    }
}

const ArticleCategory = db.define('ArticleCategory', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nameId: {
        type: Sequelize.STRING(100)
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
        beforeCreate: async (articleCategory, options) => {
            articleCategory = checkGroupBeforeInsertUpdate(articleCategory, options)
            return articleCategory
        },
        beforeUpdate: async (articleCategory, options) => {
            articleCategory = checkGroupBeforeInsertUpdate(articleCategory, options)
            return articleCategory
        },
        beforeUpsert: async (articleCategory, options) => {
            articleCategory = checkGroupBeforeInsertUpdate(articleCategory, options)
            return articleCategory
        },
        beforeDestroy: async (articleCategory, options) => {
            checkDestroyOperationIsAllowed(articleCategory.groupId, options, false)
            return articleCategory
        }
    }
})

ArticleCategory.checkGroupAffiliation = (options) => {
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


export default ArticleCategory
