
import Sequelize from 'sequelize'
import models from '../index'

import { removeUndefined } from '../../../utils/utils'
import { defaultGetter } from '../../../utils/queryUtils'
import db from '../../../utils/database'
import { generateAndSendSetPasswordEmail } from '../../../utils/setPassword'

const Op = Sequelize.Op

const TEMP_PASSWORD = 'INVALID'

export const customGetUser = async (options) => {
    if (options.args.id && (!Array.isArray(options.args.id) || options.args.id.length === 1)) {
        const user = await models.User.findOne({
            where: {
                id: options.args.id
            },
            ...options
        })
        if (user) {
            return [user]
        }
        throw models.User.authError()
    } else {
        return defaultGetter({
            ...options,
            model: models.User
        })
    }
}

export const customCreateUser = async (options) => {
    // for rest updates
    if (options.args.id) {
        return customUpdateUser(options)
    }

    return db.transaction(async transaction => {
        options.transaction = options.transaction || transaction
        const tempAttributes = {}
        if (options.args.activationRoute) {
            tempAttributes['password'] = TEMP_PASSWORD
        }

        if (options.args.password && options.args.password.length > 5) {
            tempAttributes['activated'] = new Date().getTime()
        }

        const user = await models.User.create(
            removeUndefined({
                roleId: options.args.roleId,
                firstname: options.args.firstname,
                lastname: options.args.lastname,
                email: options.args.email,
                phone: options.args.phone || null,
                languageId: options.args.languageId,
                password: options.args.password,
                belongsToGroupId: options.args.belongsToGroupId,
                image: options.args.image,
                ...tempAttributes
            }),
            options
        )

        if (options.args.activationRoute) {
            await generateAndSendSetPasswordEmail(user, options.args.activationRoute)
        }
        return user
    }, options)
}

export const customUpdateUser = async (options) => {

    const user = await models.User.findOne({
        ...options,
        useNonCustomGroup: true,
        where: {
            id: options.args.id
        },
        includeAdmin: true
    })

    if (!user) {
        throw models.User.authError()
    }

    return db.transaction(async transaction => {
        options.transaction = options.transaction || transaction

        const updateUserArgs = removeUndefined({
            roleId: options.args.roleId,
            firstname: options.args.firstname,
            lastname: options.args.lastname,
            email: options.args.email,
            phone: options.args.phone,
            languageId: options.args.languageId,
            image: options.args.image,
            password: options.args.password,
            belongsToGroupId: options.args.belongsToGroupId
        })

        // supply an empty phone for possible client-side validation purposes
        if (!updateUserArgs.phone) {
            updateUserArgs['phone'] = null
        }

        return user.update(updateUserArgs, options)
    }, options)
}


export const customDeleteUser = async (options) => {

    const users = await models.User.findAll({
        where: {
            [Op.or]: {
                id: options.args.id
            }
        },
        ...options
    })

    if (!users) {
        throw models.User.authError()
    }

    return db.transaction(async transaction => {

        options.transaction = options.transaction || transaction

        const ops = []
        users.forEach(user => {
            ops.push(
                user.destroy({ ...options })
            )
        })

        await Promise.all(ops)

        return true

    }, options)
}
