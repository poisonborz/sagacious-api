
import Sequelize from 'sequelize'

import resolvers from '@/endpoints/models/Language/Language.endpoints.resolvers'
import { createTestContext } from '../../../helper/context'


describe('Language --> resolver', () => {
    test('returns the requested language entry by ids', async (done) => {
        const context = await createTestContext()
        Sequelize.Model.findAll.mockClear()
        Sequelize.Model.findAll.mockResolvedValueOnce([{ id: 1 }])

        const result = await resolvers.Query.language(null, { id: [1, 2] }, context)
        const language = result[0]
        expect(Sequelize.Model.findAll.mock.calls.length).toBe(1)
        expect(Sequelize.Model.findAll.mock.calls[0][0].where.id).toStrictEqual({ [Sequelize.Op.or]: [1, 2] })
        expect(language.id).toBe(1)
        done()
    })

    test('returns the requested language and arrayfies the id arg', async (done) => {
        const context = await createTestContext()
        Sequelize.Model.findAll.mockClear()
        Sequelize.Model.findAll.mockResolvedValueOnce([{ id: 1 }])

        const result = await resolvers.Query.language(null, { id: 1 }, context)
        const language = result[0]
        expect(Sequelize.Model.findAll.mock.calls.length).toBe(1)
        expect(Sequelize.Model.findAll.mock.calls[0][0].where.id).toStrictEqual({ [Sequelize.Op.or]: [1] })
        expect(language.id).toBe(1)
        done()
    })
})
