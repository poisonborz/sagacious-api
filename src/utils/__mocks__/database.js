import { rejectError } from '../../../__tests__/unit/helper/model'
import Sequelize from 'sequelize'

Sequelize.prototype.query = jest.fn(rejectError('db.query'))
// Hooks need a real connection
Sequelize.prototype.runHooks = jest.fn()

export default new Sequelize({ dialect: 'mysql' })
