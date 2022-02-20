
import Sequelize from 'sequelize'
import db from '../../../utils/database'


const Translation = db.define('Translation', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    en_us: {
        type: Sequelize.TEXT()
    },
    de_de: {
        type: Sequelize.TEXT()
    }
})

export default Translation
