
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import * as Sqrl from 'squirrelly'

import { getSecret } from './secrets'
import translations from '../mails/translations'
import logger from './logger'

dotenv.config()

const SMTP_USER = process.env.SMTP_USER || getSecret(process.env.SMTP_USER_FILE)
const SMTP_PASS = process.env.SMTP_PASS || getSecret(process.env.SMTP_PASS_FILE)
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT

if (!SMTP_USER) {
    logger.error('SMTP_USER env variable / secret not set', { critical: true })
}

if (!SMTP_PASS) {
    logger.error('SMTP_PASS env variable / secret not set', { critical: true })
}


const composeTemplate = async (templateName, language, vars) => {

    const templateContent = fs.readFileSync(
        path.join(__dirname, '..', 'mails', language, `${templateName}.html`), 'utf8'
    )

    return vars ? Sqrl.Render(templateContent, vars) : templateContent
}


const sendMail = async ({ senderName, senderEmail, recipient, subject, content, bcc }) => {
    if (!senderName || !recipient || !subject || !content) {
        logger.error('Required mail args not supplied', { senderName, senderEmail, recipient, subject, contentPresent: Boolean(content) })
        return false
    }


    senderEmail = senderEmail || 'system@acmecorp.com'

    let transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    })

    const from = `${senderName} ${senderEmail}`

    let info = await transporter.sendMail({
        from,
        to: recipient,
        bcc,
        subject,
        html: content
    })

    const accepted = info.accepted.length > 0
    if (!accepted) {
        logger.warn('Email was not accepted', { info, senderName, senderEmail, recipient, subject })
    }

    return accepted
}

export const sendRecoveryMail = async ({ user, resetLink }) => {

    const langCode = (await user.getLanguage() || {}).code || 'en_us'

    const [header, content, footer] = await Promise.all([
        composeTemplate('header', langCode),
        composeTemplate('recovery', langCode, {
            resetLink
        }),
        composeTemplate('footer', langCode, { systemName: process.env.BRANDING_NAME })
    ])

    return sendMail({
        senderName: process.env.BRANDING_NAME,
        senderEmail: process.env.BRANDING_SUPPORTMAIL,
        recipient: user.email,
        subject: translations.mailSubject_recovery[langCode],
        content: header + content + footer
    })
}

export const sendPasswordSetMail = async ({ user, resetLink }) => {

    const brandVars = user.brand || await getBrandByGroupId(user.belongsToGroupId)
    const langCode = user.langCode || (await user.getLanguage() || {}).code || 'en_us'

    const [header, content, footer] = await Promise.all([
        composeTemplate('header', langCode, { ...brandVars }),
        composeTemplate('set-password', langCode, {
            ...brandVars,
            userName: extractUserName(user),
            userEmail: user.email,
            resetLink
        }),
        composeTemplate('footer', langCode, { systemName: process.env.BRANDING_NAME })
    ])

    return sendMail({
        senderName: process.env.BRANDING_NAME,
        senderEmail: process.env.BRANDING_SUPPORTMAIL,
        recipient: user.email,
        subject: translations.mailSubject_setPassword[langCode],
        content: header + content + footer
    })
}


const extractUserName = user => {
    if (!user) return

    const name = []

    if (user.firstname) {
        name.push(user.firstname)
    }

    if (user.lastname) {
        name.push(user.lastname)
    }

    if (!name.length) {
        name.push(user.email)
    }

    return name.join(' ').trim()
}

