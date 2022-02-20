
import DataLoader from 'dataloader'

import models from '../../models'
import { sortAndFill } from '../../../utils/DataLoader'
import { defaultGetter } from '../../../utils/queryUtils'

export const usersByIds = async (options, ids) => {
    const users = await defaultGetter({
        ...options, args: { id: ids }, model: models.User
    })

    return sortAndFill(users, ids, 'id')
}

export default {
    user: opt => new DataLoader(keys => usersByIds(opt, keys))
}
