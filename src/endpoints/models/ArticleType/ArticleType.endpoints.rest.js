
import {
    customGetArticleType,
    customCreateArticleType,
    customDeleteArticleType
} from './ArticleType.handlers'

export default {
    ops: {
        get: customGetArticleType,
        post: customCreateArticleType,
        delete: customDeleteArticleType
    }
}
