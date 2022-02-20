
import { reportClient } from './ReportClientEvent.handlers'

export default {
    Mutation: {
        reportClientEvent (root, args, context) {
            return reportClient({ root, args, context }, 'event')
        },
        reportClientPageview (root, args, context) {
            return reportClient({ root, args, context }, 'pageview')
        }
    }
}
