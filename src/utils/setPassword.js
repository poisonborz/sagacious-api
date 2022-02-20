
import { sendPasswordSetMail } from './mail'
import { generateOneTimeToken } from './token'
import { getDomain } from './domain'


export const generateAndSendSetPasswordEmail = async (user, route) => {
    const resetLink = await generateLink(user, route)

    return sendPasswordSetMail({ user, resetLink })
}

const generateLink = async (user, route) => {
    const token = await generateOneTimeToken({ email: user.email }, { expiresIn: '1d' })
    const domain = await getDomain(user, user.brand)

    return `${domain}${route}&code=${token}`
}
