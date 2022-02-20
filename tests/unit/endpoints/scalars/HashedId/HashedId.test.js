
import Hashids from 'hashids'

import { composeValue, HASH_SECRET, parseValue } from '@/endpoints/scalars/HashedId/HashedId'

const hash = new Hashids(HASH_SECRET, 8)
const ID = 1
const ID_ENCODED = hash.encode(ID)

describe('Scalar ==> HashedId >> ', () => {
    test('it encodes input correctly', () => {
        expect(composeValue(ID)).toBe(ID_ENCODED)
    })

    test('it decodes input correctly', () => {
        expect(parseValue(ID_ENCODED)).toBe(ID)
    })
})
