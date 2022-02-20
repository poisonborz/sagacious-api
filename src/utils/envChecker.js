
import fs from 'fs'
import path from 'path'

const parse = (src) => {
    const obj = {}

    src.toString().split('\n').forEach((line) => {
        const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (keyValueArr !== null) {
            const key = keyValueArr[1]

            let value = keyValueArr[2] || ''

            const len = value ? value.length : 0
            if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
                value = value.replace(/\\n/gm, '\n')
            }

            value = value.replace(/(^['"]|['"]$)/g, '').trim()

            obj[key] = value
        }
    })

    return obj
}

export default () => {
    if (process.env.NODE_ENV === 'development') {
        const dotEnvPath = path.resolve(process.cwd(), '.env')
        const dotEnvDependenciesPath = path.resolve(process.cwd(), '.env.dependencies')
        const encoding = 'utf8'

        const envVariables = parse(fs.readFileSync(dotEnvPath, { encoding }))
        const envDependencies = parse(fs.readFileSync(dotEnvDependenciesPath, { encoding }))

        const missingDependencies = []
        const noValueDependencies = []

        Object.keys(envDependencies).forEach((key) => {
            if (!envVariables.hasOwnProperty(key) && !process.env.hasOwnProperty(key)) {
                missingDependencies.push(key)
            } else if (!envVariables[key] && !process.env[key]) {
                noValueDependencies.push(key)
            }
        })

        if (missingDependencies.length > 0) {
            throw new Error(`ENV variable(s) ${missingDependencies.join(', ')} are missing`)

        } else if (noValueDependencies.length > 0) {
            throw new Error(`ENV variable(s)  ${noValueDependencies.join(', ')} does not have any values`)
        }
    }
}
