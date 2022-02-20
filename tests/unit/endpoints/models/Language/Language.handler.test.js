
import Sequelize from 'sequelize'

import { customGetLanguage } from '@/endpoints/models/Language/Language.handlers'
import { createTestContext } from '../../../helper/context'

describe('Language --> handler', () => {
    test('default get method works', async (done) => {
        const langId = 1
        const context = await createTestContext()
        Sequelize.Model.findAll.mockResolvedValueOnce([{ id: 1 }])

        const result = await customGetLanguage({ args: { id: langId }, context })
        const language = result[0]

        expect(language.id).toBe(langId)
        done()
    })
})
