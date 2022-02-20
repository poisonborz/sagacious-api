
import sharp from 'sharp'
import fs from 'fs'
import shortid from 'shortid'

import { s3DeleteFile, s3Upload, s3GetKey } from './s3'
import { localTransientFolder } from './transientFile'
import { composeValue as encodeId } from '../endpoints/scalars/HashedId/HashedId'

const convertImage = async (transientImageFileName, imageSize) => {
    const originalTransientImagePath = `${localTransientFolder}/${transientImageFileName}`
    const uniqueId = shortid.generate()
    const whiteBg = { r: 255, g: 255, b: 255 }

    if (!Number.isInteger(imageSize) || imageSize <= 100 || imageSize > 1800) {
        throw new Error('Invalid image size')
    }

    if (!fs.existsSync(originalTransientImagePath)) {
        throw new Error('Image does not exist')
    }

    // convert image to propotional rectangle ('contain' mode), white background, compressed jpg
    const process = async (resultSize, suffix) => {
        // original filename without extension
        const resultPath = `${localTransientFolder}/${uniqueId}${suffix}.jpg`

        await sharp(originalTransientImagePath)
            .resize(resultSize, resultSize, {
                kernel: sharp.lanczos2,
                fit: 'contain',
                background: whiteBg
            })
            .jpeg({
                quality: 84
            })
            .flatten({ background: whiteBg })
            .toFile(resultPath)
        return resultPath
    }

    if (!transientImageFileName.split('.').pop().match(/(jpg|jpeg|gif|png|webp)/)) {
        fs.unlink(originalTransientImagePath, err => {
            throw err || new Error('Invalid file format')
        })
    } else {
        // original, half, thumbnail sizes

        const resultArray = await Promise.all([
            process(imageSize, '_2x'),
            process(imageSize / 2, ''),
            process(100, '_thumb')
        ])
        await new Promise((resolve, reject) => {
            fs.unlink(originalTransientImagePath, err => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
        return resultArray
    }
}

const uploadTransientImageSet = async ({ generatedTransientImageSet, itemId, imageCategory }) => {
    const s3Result = await Promise.all(
        generatedTransientImageSet.map(transientImagePath => {
            const fileEnd = transientImagePath.replace(/^.*[\\/]/, '')
            return s3Upload(
                transientImagePath,
                null,
                `images/${imageCategory}/${itemId ? `${encodeId(itemId)}_` : ''}${fileEnd}`
            )
        })
    )
    return { resultUrl: s3Result[1], generatedTransientImageSet }
}

// userId is for making it part of the filename
// imagesize is rectangular height and width (used for hdpi 2x size, normal will be half size)
// existingImageUrl is previously stored filename of the item, to be deleted
// itemId used for hashing it in filename for reference
// category is item type, eg user, articlecategory
export default async ({ transientImageFileName, imageSize, existingImageUrl, itemId, imageCategory }) => {
    const convertedImage = await convertImage(transientImageFileName, imageSize)
    if (existingImageUrl) {
        await Promise.all(
            ['', '_2x', '_thumb'].map(suffix => {
                return s3DeleteFile(s3GetKey(
                    existingImageUrl.split('/').slice(0, existingImageUrl.split('/').length - 1).join('/') +
                        '/' +
                        existingImageUrl.split('/').pop().replace('.', suffix + '.')).slice(1)) // remove the beginning slash
            })
        )
    }
    const { resultUrl, generatedTransientImageSet } = await uploadTransientImageSet({
        generatedTransientImageSet: convertedImage, itemId, imageCategory
    })

    return new Promise((resolve, reject) => {
        fs.unlink(generatedTransientImageSet[0], err => {
            if (err) {
                reject(err)
            }
            resolve(resultUrl)
        })
    })
}
