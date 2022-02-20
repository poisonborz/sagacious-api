import Sequelize from 'sequelize'
import db from '../../../utils/database'

const Op = Sequelize.Op

const Role = db.define('Role', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nameId: {
        type: Sequelize.INTEGER(11)
    },
    key: {
        type: Sequelize.STRING(45),
        allowNull: false
    },
    ownedByGroupId: {
        type: Sequelize.BOOLEAN
    },
    created: {
        type: Sequelize.DATE
    },
    updated: {
        type: Sequelize.DATE
    }
})

Role.checkGroupAffiliation = (options) => {
    options.groupAffiliationHandled = true
    options.where = {
        [Op.and]: {
            [Op.and]: {
                ...options.where
            },
            ownedByGroupId: {
                [Op.or]: {
                    [Op.in]: (options.context.usersGroups || []).map(g => g.id),
                    [Op.eq]: null
                }
            }
        }
    }
    return options
}

export default Role
