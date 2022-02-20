
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import models from '../endpoints/models'
import { sendRecoveryMail } from './mail'
import { generateOneTimeToken, verifyOneTimeToken } from './token'
import { getDomain } from './domain'

const generateLink = async (user, route) => {
    const token = await generateOneTimeToken({ email: user.email }, { expiresIn: '1d' })
    const domain = await getDomain(user)
    return `${domain}${route}&code=${token}`
}

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
        const resetLink = await generateLink(data, route)
        const result = await sendRecoveryMail({ user: data, resetLink })
        if (!result) {
            return res.status(500).json({ success: false, msg_code: 'password_reset_email_failed' })
        }
    }

    res.json({ success: true, msg_code: 'password_reset_email_sent' })
})

router.delete('/:token', async ({ params: { token }, body: { password } }, res, next) => {
    try {
        const { email } = await verifyOneTimeToken(token, true)
        if (!password) {
            return res.status(400).json({ success: false, msg_code: 'req_password' })
        }
        await models.User.update(
            { password: await bcrypt.hash(password, 10), activated: new Date().getTime() },
            { where: { email } }
        )
        res.status(200).json({ success: true, msg_code: 'password_reset_successfully' })
    } catch (e) {
        res.status(404).send(`Cannot DELETE /auth/password-reset/${token}`)
    }
})

export const passwordReset = router
