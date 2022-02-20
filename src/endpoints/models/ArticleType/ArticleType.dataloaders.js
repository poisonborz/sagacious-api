
import DataLoader from 'dataloader'

import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill } from '../../../utils/DataLoader'

export const articleTypesByIds = async (options, ids) => {
    const articleTypes = await defaultGetter({ ...options, args: { id: ids }, model: models.ArticleType })
    return sortAndFill(articleTypes, ids, 'id')
}

export default {
    articleType: opt => new DataLoader(keys => articleTypesByIds(opt, keys)),
    articleTypeInsecure: opt => new DataLoader(keys => articleTypesByIds(
        { ...opt, groupAffiliationHandled: true },
        keys
    ))
}
