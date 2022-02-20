
import Sequelize from 'sequelize'

import rest from '@/endpoints/models/Language/Language.endpoints.rest'
import { createTestContext } from '../../../helper/context'


describe('Language --> rest', () => {
    test('GET endpoint returns expected result', async (done) => {
        const langId = 1
        const context = await createTestContext()
        Sequelize.Model.findAll.mockResolvedValueOnce([{ id: 1 }])
        const result = await rest.ops.get({ args: { id: langId }, context })
        const language = result[0]

        expect(language.id).toBe(langId)
        done()
    })

    test('POST endpoint is not defined', async (done) => {
        expect(rest.ops.post).toBeNull()
        done()
    })

    test('DELETE endoint is not defined', async (done) => {
        expect(rest.ops.delete).toBeNull()
        done()
    })
})
