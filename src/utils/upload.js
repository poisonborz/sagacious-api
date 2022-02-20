
import fs from 'fs'

import { HttpError } from './HttpError'
import { s3DeleteFile, s3Upload, s3GetKey, s3RenameFile } from './s3'
import { localTransientFolder } from './transientFile'

const getArticleDocumentBucketKey = (category, name) => `documents/${category}/${name}`

const uploadTransientFile = ({ transientFileName, documentName, fileCategory }) => {
    const originalTransientFilePath = getTransientFilePath(transientFileName)

    return s3Upload(
        originalTransientFilePath,
        null,
        getArticleDocumentBucketKey(fileCategory, documentName)
    )
}

const getTransientFilePath = fileName => `${localTransientFolder}/${fileName}`

export const deleteExistingFile = async ({ existingFileUrl }) => {
    if (existingFileUrl) {
        return s3DeleteFile(s3GetKey(existingFileUrl))
    }
}

const checkAllowedFileSize = async ({ transientFileName, maxFileSize }) => {
    const filePath = getTransientFilePath(transientFileName)
    const fileInfo = fs.statSync(filePath)

    if (!Number.isInteger(maxFileSize) || fileInfo.size > maxFileSize) {
        throw HttpError.badRequest('Invalid file size')
    }
}

const checkAllowedFileTypes = async ({ transientFileName, allowedFileTypes }) => {
    const fileType = (transientFileName || '').toLowerCase().split('.').pop()

    if (!allowedFileTypes.includes(fileType)) {
        fs.unlink(getTransientFilePath(transientFileName), err => {
            throw (err || new Error('Invalid file format'))
        })
    }
}

export const renameUploadedFile = async ({ fileUrl, newName, fileCategory }) => {
    const oldKey = s3GetKey(fileUrl)
    const newKey = getArticleDocumentBucketKey(fileCategory, newName)

    const newFileUrl = await s3RenameFile(oldKey, newKey)
    await s3DeleteFile(oldKey)
    return newFileUrl
}

export default async (args) => {
    await checkAllowedFileSize(args)
    await checkAllowedFileTypes(args)
    await deleteExistingFile(args)

    const resultUrl = await uploadTransientFile(args)
    return new Promise((resolve, reject) => {
        fs.unlink(getTransientFilePath(args.transientFileName), err => {
            reject(err)
        })
        resolve(resultUrl)
    })
}
