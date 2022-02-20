
const extentionsTypes = {
    mp4: { mimeType: 'video/mp4', type: 'video' },
    avi: { mimeType: 'video/x-msvideo', type: 'video' },

    aac: { mimeType: 'audio/aac', type: 'audio' },
    mp3: { mimeType: 'audio/mpeg', type: 'audio' },
    m4a: { mimeType: 'audio/x-m4a', type: 'audio' },
    aiff: { mimeType: 'audio/x-aiff', type: 'audio' },
    alac: { mimeType: 'audio/alac', type: 'audio' },
    flac: { mimeType: 'audio/flac', type: 'audio' },
    wav: { mimeType: 'audio/wav', type: 'audio' },

    jpg: { mimeType: 'image/jpg', type: 'image' },
    jpeg: { mimeType: 'image/jpeg', type: 'image' },
    gif: { mimeType: 'image/gif', type: 'image' },
    png: { mimeType: 'image/png', type: 'image' },

    pdf: { mimeType: 'application/pdf', type: 'document' },
    doc: { mimeType: 'application/msword', type: 'document' },
    docx: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'document' },
    xls: { mimeType: 'application/vnd.ms-excel', type: 'document' },
    xlsx: { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', type: 'document' },
    ppt: { mimeType: 'application/vnd.ms-powerpoint', type: 'document' },
    pptx: { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', type: 'document' },
    pub: { mimeType: 'pplication/x-mspublisher', type: 'document' },
    csv: { mimeType: 'text/csv', type: 'document' },
    txt: { mimeType: 'text/plain', type: 'document' },
    json: { mimeType: 'application/json', type: 'document' }
}

const isTypeAvailable = type => Object.keys(extentionsTypes).includes(type)

export const allowedFileTypes = [...new Set(Object.keys(extentionsTypes))]

export const typeKeyForFilename = filename => {
    if (/^(http|https):/gm.test(filename)) {
        return 'weblink'
    }

    const fix = filename.split('.').slice(-1).join('')
    return isTypeAvailable(fix)
        ? extentionsTypes[fix].type
        : 'document'
}

export const getContentType = (filename) => {
    const fix = filename.split('.').slice(-1).join('')
    if (isTypeAvailable(fix)) {
        return extentionsTypes[fix].mimeType
    } else {
        return 'application/octet-stream'
    }
}
