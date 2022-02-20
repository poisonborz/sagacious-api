
import { customGetLanguage } from './Language.handlers'

export default {
    Query: {
        language (root, args, context) {
            return customGetLanguage({ root, args, context })
        }
    }
}
