
import DataLoader from 'dataloader'
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill } from '../../../utils/DataLoader'

export const articleCategoriesByIds = async (options, ids) => {
    const articleCategories = await defaultGetter({ ...options, args: { id: ids }, model: models.ArticleCategory })
    return sortAndFill(articleCategories, ids, 'id')
}

export default {
    articleCategory: opt => new DataLoader(keys => articleCategoriesByIds(opt, keys)),
    articleCategoryInsecure: opt => new DataLoader(keys => articleCategoriesByIds(
        { ...opt, groupAffiliationHandled: true },
        keys
    ))
}
