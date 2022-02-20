
import { Router } from 'express'

import models from '../endpoints/models'
import { generateAndSendSetPasswordEmail } from './setPassword'

const router = new Router()

router.post('', async ({ body: { email, route } }, res, next) => {

    if (!email) {
        return res.status(400).json({ success: false, msg_code: 'req_email' })
    }

    const data = await models.User.findOne({
        where: { email },
        includeAdmin: true,
        groupAffiliationHandled: true
    })

    if (data) {
        const result = await generateAndSendSetPasswordEmail(data, route)
        if (!result) {
            return res.status(500).json({ success: false, msg_code: 'password_reset_email_failed' })
        }
    }

    res.json({ success: true, msg_code: 'password_set_email_sent' })
})


export const passwordSet = router
