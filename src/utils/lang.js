
import { customGetLanguage } from '../endpoints/models/Language/Language.handlers'
import { composeValue } from '../endpoints/scalars/HashedId/HashedId'

export const availableLanguages = async (req, res, next) => {
    const languages = await customGetLanguage({
        raw: true,
        args: {}
    })

    if (Array.isArray(languages)) {
        // hash ids
        languages.forEach(lang => {
            if (!(lang && lang.id)) return

            lang.id = composeValue(lang.id)
        })
    }

    return res.json(languages)
}
