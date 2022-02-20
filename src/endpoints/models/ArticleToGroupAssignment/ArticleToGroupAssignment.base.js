
import Sequelize from 'sequelize'
import db from '../../../utils/database'

const Op = Sequelize.Op

const ArticleToGroupAssignment = db.define('ArticleToGroupAssignment', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    articleId: {
        type: Sequelize.INTEGER(11)
    },
    groupId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    assignmentDepth: {
        type: Sequelize.INTEGER(6),
        allowNull: false
    }
})

ArticleToGroupAssignment.checkGroupAffiliation = (options) => {
    options.groupAffiliationHandled = true
    options.where = {
        [Op.and]: {
            [Op.and]: {
                ...options.where
            },
            groupId: {
                [Op.in]: options.context.usersGroupsIds
            }
        }
    }
    return options
}

export default ArticleToGroupAssignment
