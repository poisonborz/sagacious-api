
import Sequelize from 'sequelize'

import { allLanguages } from '@/endpoints/models/Language/Language.dataloaders'
import { createTestContext } from '../../../helper/context'


describe('Language --> dataloader', () => {
    test('allLanguages method works', async (done) => {
        const context = await createTestContext()
        Sequelize.Model.findAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

        const languages = await allLanguages({ context }, [1, 2])

        // each key should have the list of all languages
        expect(languages).toHaveLength(2)
        // languages returned are 2
        expect(languages[0].length).toBe(2)
        // each key should have the same list
        expect(languages[0].length).toBe(languages[1].length)
        expect(languages[0]).toStrictEqual(languages[1])

        done()
    })
})
