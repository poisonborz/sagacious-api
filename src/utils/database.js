
import Sequelize from 'sequelize'

import { getSecret } from './secrets'
import logger from './logger'

import dotenv from 'dotenv'
const dotenvSet = (dotenv.config()).parsed

if (!process.env.DBPASS && !process.env.DBPASS_FILE) {
    logger.error('No db pass found', { critical: true })
}

const DBPASS = process.env.DBPASS || getSecret(process.env.DBPASS_FILE)

const envvar = (name, fallback) => (dotenvSet && dotenvSet[name]) ? dotenvSet[name] : (process.env[name] || fallback)

export default new Sequelize(
    envvar('DBNAME'),
    envvar('DBUSER'),
    envvar('DBPASS', DBPASS),
    {
        host: process.env.DBURL,
        port: process.env.DBPORT,
        dialect: 'mysql',
        logging: process.env.DEV_DISABLE_DBLOGS ? false : (m) => logger.debug(m),
        define: {
            timestamps: false,
            freezeTableName: true
        },
        pool: {
            max: 15,
            min: 0,
            acquire: 30000,
            idle: 120000
        }
    }
)
