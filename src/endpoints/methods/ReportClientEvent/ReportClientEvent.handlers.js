
import ua from 'universal-analytics'

import logger from '../../../utils/logger'

export const reportClient = async (options, action) => {
    if (process.env.ANALYTICS_KEY || options.context.customAnalyticsKey) {
        let eventArgs

        switch (action) {

            case 'event':
                eventArgs = [
                    options.args.eventCategory,
                    options.args.eventAction,
                    options.args.eventLabel,
                    options.args.eventValue,
                    { client: options.context.project }
                ]
                break

            case 'pageview':
                eventArgs = [
                    {
                        dp: options.args.pageviewPath,
                        dt: options.args.pageviewTitle,
                        client: options.context.project
                    }
                ]
                break

            default:
                logger.warn('Invalid reportClient action', {
                    action,
                    user: options.context.authUser.email
                })
                return false
        }

        if (options.context.customAnalyticsKey) {

            let visitor = ua(
                options.context.customAnalyticsKey,
                options.context.authUser.email,
                {
                    uid: options.context.authUser.email,
                    strictCidFormat: false
                }
            )

            visitor[action](...eventArgs)
            visitor.send()
        } else {
            options.context.trackingUser[action](...eventArgs).send()
        }

        return true
    } else {
        return false
    }
}
