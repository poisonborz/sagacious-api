
import models from '../index'
import Language from '../Language/Language.base'
import { defaultGetter } from '../../../utils/queryUtils'
import { removeUndefined } from '../../../utils/utils'

// NOTE: this means the list of languages is not dynamic, for the sake of performance
// changes require the restart of the server. since lang changes require multiple changes, this is ok
// change this if this is no longer the case
const langs = Promise.resolve(Language.findAll({}))

export const customGetTranslations = async (options) => {
    const langList = (await langs || [])

    return (await defaultGetter({ ...options, model: models.Translation }))
        .map(tr => fillTranslation(tr, langList))
}

export const fillTranslation = (tr, langList) => {
    tr.languages = langList
        .filter((lang) => tr[lang.code])
        .map((lang) => ({
            id: tr.id,
            code: lang.code,
            text: tr[lang.code]
        }))
    return tr
}

export const formTranslationInput = args => {
    let langInput = {}
    const { languages } = args

    if (Array.isArray(languages)) {

        // needs to be changed when translation table structure is changed
        langInput = Object.fromEntries(languages.map(({ code, text }) => [code, text]))
    }

    if (args.id) {
        langInput['id'] = args.id
    }

    return langInput
}

export const customCreateTranslation = async (options, forceInsert) => {
    if (options.args.id && !forceInsert) {
        return customUpdateTranslation(options)
    }

    const langInput = formTranslationInput(options.args)

    return models.Translation.create(removeUndefined(langInput), options)
}

export const createOrUpdateTranslation = async options => {
    if (!options.args.id) {
        return customCreateTranslation(options)
    }

    const translationObject = await models.Translation.findOne({
        ...options,
        where: {
            id: options.args.id
        }
    })

    if (translationObject) {
        return customUpdateTranslation(options)
    }

    return customCreateTranslation(options)
}

export const customUpdateTranslation = async (options) => {
    return models.Translation.findOne({
        context: options.context,
        where: {
            id: options.args.id
        }
    }).then(translation => {
        if (translation) {
            const langInput = formTranslationInput(options.args)

            return translation.update(removeUndefined(langInput), options)
        } else {
            throw models.Translation.authError()
        }
    })
}
