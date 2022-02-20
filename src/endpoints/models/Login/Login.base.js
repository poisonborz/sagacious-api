
import Sequelize from 'sequelize'
import db from '../../../utils/database'

const Login = db.define('Login', {
    id: {
        type: Sequelize.INTEGER(15),
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    revoked: {
        type: Sequelize.BOOLEAN
    },
    meta: {
        type: Sequelize.STRING(150)
    },
    metaHash: {
        type: Sequelize.STRING(10)
    },
    expiration: {
        type: Sequelize.DATE()
    }
})

export default Login
