
import fs from 'fs'
import path from 'path'
import shortid from 'shortid'

import { s3ListFiles, s3DeleteFile, s3Upload } from './s3'
import { composeValue as encodeId } from '../endpoints/scalars/HashedId/HashedId'
import logger from './logger'


export const localTransientFolder =
    path.resolve(path.dirname(require.main.filename), '..', process.env.LOCAL_TRANSIENT_DIR)

if (!fs.existsSync(localTransientFolder)) {
    logger.error('Upload dir does not exist', { critical: true, directory: process.env.LOCAL_TRANSIENT_DIR })
}

export const clearOldTransientFiles = () => s3ListFiles('temp/')
    .then(transientFiles => {
        transientFiles.forEach(transientFile => {
            if (((new Date()).getUTCDate()) - (new Date(transientFile.LastModified)) > (60 * 60 * 1000)) { // one hour
                s3DeleteFile(transientFile.Key)
            }
        })
    }).then(result => {
        fs.readdir(localTransientFolder, (err, transientFiles) => {
            if (err) {
                throw err
            }

            transientFiles.forEach((transientFile) => {
                fs.stat(transientFile, (err, transientFileStats) => {

                    if (err) {
                        throw err
                    }

                    if (((new Date()).getUTCDate()) - (new Date(transientFileStats.mtime)) > (10 * 60 * 1000)) { // 10m
                        fs.unlinkSync(transientFile)
                    }

                })
            })

            return true
        })
    })

export const createLocalTransientFile = (stream, fileFormat) => {
    const transientFileName = `${shortid.generate()}.${fileFormat}` // uid + original extension
    const path = `${localTransientFolder}/${transientFileName}`
    return new Promise((resolve, reject) =>
        stream
            .on('error', error => {
                if (stream.truncated) {
                    fs.unlinkSync(path)
                }
                reject(error)
            })
            .pipe(fs.createWriteStream(path))
            .on('error', error => reject(error))
            .on('close', () => resolve(transientFileName))
    )
}


export const createRemoteTransientFile = ({ fileName, fileStream, fileStreamName, userId }) => {

    const extension = (fileName || fileStreamName).split('.').pop()

    const key = `transient/${userId ? `${encodeId(userId)}_` : ''}${shortid.generate()}.${extension}`

    return s3Upload((fileName ? `${localTransientFolder}/${fileName}` : null), fileStream, key)
}
