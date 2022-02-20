
import hashIdScalar from '@/endpoints/scalars/HashedId/HashedId'
import jsonScalar from '@/endpoints/scalars/JSON/JSON'
import timestampScalar from '@/endpoints/scalars/Timestamp/Timestamp'

/* eslint-disable */
const scalars = {
    Upload: () => 'mocked upload',
    HashedId: () => hashIdScalar.HashedId,
    JSON: () => jsonScalar.JSON,
    Timestamp: () => timestampScalar.Timestamp
}

export default scalars
