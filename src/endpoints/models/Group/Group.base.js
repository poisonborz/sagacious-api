
import Sequelize from 'sequelize'

import db from '../../../utils/database'
import { HttpError } from '../../../utils/HttpError'

const Op = Sequelize.Op

const checkGroupBeforeInsertUpdate = async (group, options) => {
    if (options.args.parentGroupId) {
        const parentGroup = options.context.usersGroups.find(g =>
            g.id === group.parentGroupId
        )

        if (!parentGroup) {
            throw HttpError.fromCode('no_perm_childgroup')
        }

        group.rootGroupId = parentGroup.isRoot ? parentGroup.id : parentGroup.rootGroupId
        group.treeRootId = parentGroup.treeRootId ? parentGroup.treeRootId : parentGroup.id
    }

    return group
}

const Group = db.define('Group', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    parentGroupId: {
        type: Sequelize.INTEGER(11)
    },
    isRoot: {
        type: Sequelize.INTEGER(1)
    },
    image: {
        type: Sequelize.STRING(150)
    },
    rootGroupId: {
        type: Sequelize.INTEGER(11)
    },
    treeRootId: {
        type: Sequelize.INTEGER(11)
    },
    groupTypeId: {
        type: Sequelize.INTEGER(11)
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
        },
        beforeCreate: async (group, options) => {
            group = checkGroupBeforeInsertUpdate(group, options)
            return group
        },
        beforeUpdate: async (group, options) => {
            group = checkGroupBeforeInsertUpdate(group, options)
            return group
        },
        beforeUpsert: async (group, options) => {
            group = checkGroupBeforeInsertUpdate(group, options)
            return group
        }
    }
})

Group.checkGroupAffiliation = (options) => {
    if (!options.groupAffiliationHandled) {
        options.groupAffiliationHandled = true
        options.where = {
            [Op.and]: {
                [Op.and]: {
                    ...options.where
                },
                id: {
                    [Op.in]: options.context.usersGroupsIds
                }
            }
        }
    }

    return options
}

export default Group
