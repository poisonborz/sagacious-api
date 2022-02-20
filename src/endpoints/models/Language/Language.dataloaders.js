import DataLoader from 'dataloader'
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'
import { sortAndFill } from '../../../utils/DataLoader'

export const allLanguages = async (options, keys) => {
    // key has no effect on result. call without one.
    const all = await models.Language.findAll(options)
    return keys.map(key => all)
}

export const languageByIds = async (options, ids) => {
    const languages = await defaultGetter({
        ...options, args: { id: ids }, model: models.Language
    })

    return sortAndFill(languages, ids, 'id')
}

export default {
    allLanguages: opt => new DataLoader(keys => allLanguages(opt, keys)),
    language: opt => new DataLoader(keys => languageByIds(opt, keys))
}
