
import { Sequelize } from 'sequelize'

import { buildContext } from '@/utils/context'
import models from '@/endpoints/models/index'

/**
 * This finction will create a context to be used in tests
 * @typedef {object} Config
 * @property {object} [user] user to be mocked `{ id: 142, belongsToGroupId: 12 }`
 * @property {object} [ownGroup] own group to be mocked `{ id: 12, isRoot: true, treeRootId: 12 }`
 * @property {array<object>} [userGroups] the groups down the hierarchy, will be added to the ownGroup, `[]`
 * @property {object} [headers] custom headers to put in the context `{}`
 * @property {object} [role] the role of the logged user `{ id: 1, key: 'SuperUser' }`
 * @property {array<object>} [groupsInTree] list of groups if in your function gropsInTree is used, `[]`
 * @param {Config} args config for the mock context
 */
export const createTestContext = async (args = {}) => {
    const request = { headers: { ...args.headers } }
    const user = { id: 142, belongsToGroupId: 12, ...args.user }
    const ownGroup = { id: 12, isRoot: true, treeRootId: 12, ...args.ownGroup }
    const userId = user.id
    const role = { id: 1, key: 'SuperUser', ...args.role }
    const userModel = new models.User(user)
    Sequelize.Model.findOne.mockResolvedValueOnce(userModel)
    Sequelize.Model.findAll.mockResolvedValueOnce([{ id: ownGroup.id }, ...args.userGroups || []])
    Sequelize.Model.findAll.mockResolvedValueOnce([ownGroup])
    // groups in the tree
    Sequelize.Model.findAll.mockResolvedValueOnce([...args.groupsInTree || []])
    // For the getRole
    models.User.prototype.getRole.mockResolvedValueOnce(new models.Role(role))

    return !args && global.__CONTEXT__
        ? global.__CONTEXT__ : buildContext(request, userId)
}
