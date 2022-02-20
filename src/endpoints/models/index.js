
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { HttpError } from '../../utils/HttpError'

const dirs = p => readdirSync(p).filter(f => !f.startsWith('__mocks__') && statSync(join(p, f)).isDirectory())

let baseModels = {}
let models = {}


// load all modules in a {} as .base, .relations if available, extend with capability checker
dirs(__dirname).forEach(model => {
    baseModels[model] = {}

    const modelPath = `${__dirname}/${model}/${model}`

    const baseModel = require(`${modelPath}.base.js`).default


    const checkAuth = (options, operation) => {
        // might be a place to build capability checking
        return true
    }
    baseModels[model].base = class Item extends baseModel {
        static authError () {
            throw HttpError.fromCode('permission_error')
        }

        static async create (item, options) {
            if (checkAuth(options, 'create')) {
                return super.create(item, options)
            } else {
                throw this.authError()
            }
        }

        static async update (item, options) {
            if (checkAuth(options, 'update')) {
                return super.update(item, options)
            } else {
                throw this.authError()
            }
        }

        static async upsert (item, options) {
            if (checkAuth(options, 'upsert')) {
                return super.upsert(item, options)
            } else {
                throw this.authError()
            }
        }

        static async findOne (options) {
            if (checkAuth(options, 'findOne')) {
                if (this.checkGroupAffiliation && !options.groupAffiliationHandled) {
                    options = this.checkGroupAffiliation(options)
                }

                return super.findOne(options)
            } else {
                throw this.authError()
            }
        }

        static async findByPk (item, options) {
            if (checkAuth(options, 'findByPk')) {
                if (this.checkGroupAffiliation && !options.groupAffiliationHandled) {
                    options = this.checkGroupAffiliation(options)
                }

                return super.findByPk(item, options)
            } else {
                throw this.authError()
            }
        }

        static async findAll (options) {
            if (checkAuth(options, 'findAll')) {
                if (this.checkGroupAffiliation && !options.groupAffiliationHandled) {
                    options = this.checkGroupAffiliation(options)
                }

                return super.findAll(options)
            } else {
                throw this.authError()
            }
        }
    }

    const relationsPath = `${modelPath}.relations.js`

    if (existsSync(relationsPath)) {
        baseModels[model].relations = require(relationsPath).default
    }
})

Object.keys(baseModels).forEach(model => {
    if (baseModels[model].relations) {
        baseModels[model].relations.forEach(relation => {
            // execute relation binding as described in relations definition
            baseModels[model].base[relation[0]](baseModels[relation[1]].base, relation[2])
        })
    }

    models[model] = baseModels[model].base
})

export default models
