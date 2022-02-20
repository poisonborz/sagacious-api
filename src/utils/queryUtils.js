
import Sequelize from 'sequelize'

const Op = Sequelize.Op

export const defaultGetter = async (options) => {
    if (options.single && !options.args.id) {
        return null
    }

    return options.model[options.single ? 'findOne' : 'findAll']({
        where: options.args.id ? {
            id: {
                [Op.or]: Array.isArray(options.args.id) ? options.args.id : [options.args.id]
            }
        } : null,
        ...options
    })
}
