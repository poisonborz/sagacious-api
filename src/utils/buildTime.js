import { readFileSync } from 'fs'
import logger from './logger'

let buildTime = String(Math.round(Date.now() / 1000))
try {
    buildTime = readFileSync('BUILDTIME', { encoding: 'ascii' }).trim()
} catch {
    logger.warn('\'BUILDTIME\' file not found, falling back to current timestamp.', { buildTime })
}

export default buildTime
