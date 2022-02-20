
import fs from 'fs'
import path from 'path'

export const loadSchema = type => {
    return Promise.all([`models/${type}/${type}`, 'scalars/scalars'].map(loadTypeSchema))
}

export const loadTypeSchema = type =>
    new Promise((resolve, reject) => {
        const pathToSchema = path.join(
            process.cwd(),
            `src/endpoints/${type}.graphql`
        )
        fs.readFile(pathToSchema, { encoding: 'utf-8' }, (err, schema) => {
            if (err) {
                return reject(err)
            }

            resolve(schema)
        })
    })
