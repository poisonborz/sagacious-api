
import { customGetArticle, customCreateArticle, customUpdateArticle } from './Article.handlers'

export default {
    ops: {
        get: customGetArticle,
        post: customCreateArticle,
        delete: customUpdateArticle
    }
}
