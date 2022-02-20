
import Sequelize from 'sequelize'
import db from '../../../utils/database'

const Language = db.define('Language', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(45),
        allowNull: false
    },
    nameNative: {
        type: Sequelize.STRING(45),
        allowNull: false
    }
})

export default Language
