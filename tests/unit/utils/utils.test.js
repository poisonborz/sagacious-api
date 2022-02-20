
import { removeUndefined } from '@/utils/utils'

describe('utils', () => {
    describe('removeUndefined', () => {
        it('should remove empty values', () => {
            const args = {
                name: 'test',
                age: undefined,
                registered: false
            }

            expect(removeUndefined(args)).toStrictEqual({ name: 'test', registered: false })
        })
    })
})
