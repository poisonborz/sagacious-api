
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'

export const customGetLanguage = (options) => {
    return defaultGetter({ ...options, model: models.Language })
}
