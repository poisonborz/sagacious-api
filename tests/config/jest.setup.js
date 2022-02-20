
import models from '@/endpoints/models/index'
import Sequelize from 'sequelize'

import { rejectError } from '../unit/helper/model'

jest.mock('@/utils/secrets')
jest.mock('@/utils/mail')
jest.mock('@/utils/database')

// Languages are loaded on app start, when needed mock some values
Sequelize.Model.findAll.mockReturnValueOnce({})
// Should mock the sequelize added methods for relations
models.User.prototype.getRole = jest.fn(rejectError('models.User.getRole'))

process.env.DEV_DISABLE_HASHIDS = false
