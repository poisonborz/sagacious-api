
import { composeValue } from '../endpoints/scalars/HashedId/HashedId'
import { HttpError } from './HttpError'

export const removeUndefined = (obj) => {
    Object.keys(obj).forEach((key) => (typeof obj[key] === 'undefined') && delete obj[key])
    return obj
}

export const toTime = (value, unit, onlySeconds = false) => {
    let valueInSeconds

    switch (unit) {
        case 'us':
            valueInSeconds = Math.floor(value / 1000000)
            break
        case 'ms':
            valueInSeconds = Math.floor(value / 1000)
            break
        case 'm':
            valueInSeconds = value * 60
            break
        case 'h':
            valueInSeconds = value * 3600
            break
        case 'd':
            valueInSeconds = value * 3600 * 24
            break
        default:
            valueInSeconds = value
            break
    }
    if (onlySeconds) {
        return { valueInSeconds }
    }
    const hours = Math.floor(valueInSeconds / 3600)
    const minutes = Math.floor((valueInSeconds - hours * 3600) / 60)
    const seconds = valueInSeconds - hours * 3600 - minutes * 60
    return {
        hours,
        minutes,
        seconds
    }
}

export const arrayfy = arg => Array.isArray(arg) ? arg : [arg]

export const checkDestroyOperationIsAllowed = (ownerGroupId, { context: { authUser, usersGroupsIds } }) => {

        if (authUser.isAdmin) {
            return true
        }

        if (authUser.role.key === 'SuperUser' && usersGroupsIds.includes(ownerGroupId)) {
            return true
        }

        throw HttpError.fromCode('permission_error')
    }

// does not handle nested objects!
export const encodeObjectsIdProps = (objectsWithUnhashedIds) => {
    objectsWithUnhashedIds.forEach(item => {
        Object.keys(item).forEach(property => {
            if (property === 'id' || property.slice(-2) === 'Id') {
                item[property] = composeValue(item[property])
            }
        })
    })

    return objectsWithUnhashedIds
}
