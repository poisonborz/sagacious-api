
import { customGetTranslations } from './Translation.handlers'

export default {
    Query: {
        translation (root, args, context) {
            return customGetTranslations({ root, args, context })
        }
    }
}
