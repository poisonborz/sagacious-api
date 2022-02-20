
import fs from 'fs'

// read possible docker variables for env
export const getSecret = (secret) => {
    try {
        return fs.readFileSync(`${secret}`, 'utf8').trim()
    } catch (err) {
        throw err
    }
}
