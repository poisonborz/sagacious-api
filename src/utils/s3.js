
import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
import dotenv from 'dotenv'
import logger from './logger'

import { getSecret } from './secrets'
import { getContentType } from './documents'

dotenv.config()

const AWS_KEY = process.env.AWS_KEY || getSecret(process.env.AWS_KEY_FILE)

if (!AWS_KEY) {
    logger.error('AWS KEY not found', { critical: true })
}

const AWS_SEC = process.env.AWS_SEC || getSecret(process.env.AWS_SEC_FILE)

if (!AWS_SEC) {
    logger.error('AWS SEC not found', { critical: true })
}

const s3Instance = new S3({
    region: process.env.AWS_REGION,
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SEC
})


export const s3GetUrl = (path) => {
    return `https://${process.env.AWS_BUCKET}/${path}`.replace(/(?<!(http:|https:))[//]+/g, '/')
}

export const s3GetKey = (path) => {
    return path.replace('https://', '').replace(process.env.AWS_BUCKET, '')
}

export const s3Upload = (filePath, fileStream, key, contentType) => {
    return new Promise((resolve, reject) => {

        const stream = filePath ? fs.createReadStream(filePath) : fileStream

        const upload = () => {
            s3Instance.putObject({
                Bucket: process.env.AWS_BUCKET,
                Key: key,
                Body: stream,
                ContentType: contentType || getContentType(stream.path),
                ACL: 'public-read'
            }).promise()
                .then(s3Result => {
                    resolve(s3GetUrl(key))
                }).catch(e => reject(e))
        }

        if (filePath) {
            stream.on('error', (err) => {
                reject(err)
            })

            stream.on('open', upload)
        } else {
            upload()
        }
    })

}

export const s3DeleteFile = async (key) => {
    return s3Instance.deleteObject({
        Bucket: process.env.AWS_BUCKET,
        Key: key
    }).promise()
}

export const s3RenameFile = async (oldKey, newKey) => {
    return new Promise((resolve, reject) => {
        s3Instance.copyObject({
            Bucket: process.env.AWS_BUCKET,
            Key: newKey,
            CopySource: `${process.env.AWS_BUCKET}${oldKey}`,
            ACL: 'public-read'
        }).promise().then(s3Result => {
            resolve(s3GetUrl(newKey))
        }).catch(e => reject(e))
    })
}

export const s3ListFiles = async (pathPrefix) => {
    return (await s3Instance.listObjects({
        Bucket: process.env.AWS_BUCKET,
        Delimiter: '/',
        Prefix: pathPrefix
    }).promise()).Contents
}
