
import Sequelize from 'sequelize'
import bcrypt from 'bcryptjs'

import db from '../../../utils/database'
import { checkDestroyOperationIsAllowed } from '../../../utils/utils'
import { HttpError } from '../../../utils/HttpError'
import logger from '../../../utils/logger'

const Op = Sequelize.Op

const checkGroupBeforeInsertUpdate = (user, options) => {
    if (options.args.belongsToGroupId) {
        if (!options.context.usersGroupsIds.find(id => id === options.args.belongsToGroupId)) {
            throw HttpError.fromCode('no_perm_group')
        }
    } else if (!user.id) {
        user.belongsToGroupId = options.context.ownGroup.id
    }

    return user
}

const hashPassword = async (user) => {
    const response = await bcrypt.hash(user.password, 10)
    user.password = response
    return user
}

const User = db.define('User', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    roleId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    belongsToGroupId: {
        type: Sequelize.INTEGER(11)
    },
    firstname: {
        type: Sequelize.STRING(100)
    },
    lastname: {
        type: Sequelize.STRING(150)
    },
    email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
            isEmail: true
        },
        unique: true
    },
    password: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
            is: /^.{6,500}$/
        }
    },
    phone: {
        type: Sequelize.STRING(150),
        validate: {
            is: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g
        }
    },
    image: {
        type: Sequelize.STRING(150)
    },
    languageId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN
    },
    created: {
        type: Sequelize.DATE
    },
    updated: {
        type: Sequelize.DATE
    },
    deleted: {
        type: Sequelize.DATE
    },
    activated: {
        type: Sequelize.DATE
    }
},
{
    hooks: {
        beforeFind: async options => {
            const AdminUserRequestAllowed =
                options.includeAdmin || options.context.authUser.isAdmin

            options.where = {
                [Op.and]: {
                    [Op.and]: {
                        ...options.where
                    },
                    isAdmin: AdminUserRequestAllowed ? { [Op.in]: [0, 1] } : 0,
                    deleted: null
                }

            }
            if (options.showDeleted) {
                delete options.where[Op.and].deleted
            }
            return options
        },
        beforeCreate: async (user, options) => {
            user = checkGroupBeforeInsertUpdate(user, options)
            return hashPassword(user)
        },
        beforeUpdate: async (user, options) => {
            user = checkGroupBeforeInsertUpdate(user, options)
            if (options.args.password) {
                return hashPassword(user)
            }
            return user
        },
        beforeUpsert: async (user, options) => {
            user = checkGroupBeforeInsertUpdate(user, options)
            if (options.args.password) {
                return hashPassword(user)
            }
            return user
        },
        beforeDestroy: async (user, options) => {
            checkDestroyOperationIsAllowed(user.belongsToGroupId, options, false)
            return user
        }
    },
    instanceMethods: {
        validPassword: async (password) => {
            return bcrypt.compare(password, this.password).then(result => {
                return result
            }).catch(err => {
                logger.error(err.message, { stack: err.stack })
                return false
            })
        }
    }
})

User.checkGroupAffiliation = (options) => {
    options.groupAffiliationHandled = true
    options.where = {
        [Op.and]: {
            [Op.and]: {
                ...options.where
            },
            belongsToGroupId: {
                [Op.in]: options.useNonCustomGroup
                    ? options.context.nonCustomUsersGroupsIds : options.context.usersGroupsIds
            }
        }
    }

    return options
}

export default User
