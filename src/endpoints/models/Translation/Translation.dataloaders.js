
import DataLoader from 'dataloader'

import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill } from '../../../utils/DataLoader'
import { fillTranslation } from './Translation.handlers'

export const translationsByIds = async (options, ids) => {
    const langList = await Promise.resolve(models.Language.findAll({}))
    const translations = (await defaultGetter({ ...options, args: { id: ids }, model: models.Translation }))
        .map(tr => fillTranslation(tr, langList))
    return sortAndFill(translations, ids, 'id')
}

export default {
    translation: opt => new DataLoader(keys => translationsByIds(opt, keys))
}
