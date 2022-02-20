
import models from '../index'
import { defaultGetter } from '../../../utils/queryUtils'

export const customGetRole = (options) => {
    return defaultGetter({ ...options, model: models.Role })
}
