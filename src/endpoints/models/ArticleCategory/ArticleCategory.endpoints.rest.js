
import { customGetArticleCategory, customCreateArticleCategory, customDeleteArticleCategory } from './ArticleCategory.handlers'

export default {
    ops: {
        get: customGetArticleCategory,
        post: customCreateArticleCategory,
        delete: customDeleteArticleCategory
    }
}
