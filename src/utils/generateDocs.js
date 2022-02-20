
import fs from 'fs-extra'
import path from 'path'
import { importSchema } from 'graphql-import'

const docsGraphqlFolder = path.resolve(path.join('.', 'docs', 'graphql'))

export const generateGraphqlDocs = (customSchema) => {

    const schema = customSchema || importSchema(path.join('.','src','endpoints','scheme.graphql'))

    // create temporary file for schema, we'll remove it in the end
    fs.writeFileSync('./schema.graphql', schema)

    // for sake of order and since module empties output folder, we'll have to move around the template while generation happens
    fs.moveSync(path.join(docsGraphqlFolder, 'template'), path.join('.', 'docs', 'template'), { overwrite: true })
    fs.removeSync(docsGraphqlFolder)

    require('child_process').execSync(
        'node ./node_modules/@graphidocs/docs/bin/graphidocs.js' +
        ' -t ./docs/template -s ./schema.graphql -o ./docs/graphql',
        { stdio: 'inherit' }
    )

    fs.moveSync(path.join('.', 'docs', 'template'), path.join(docsGraphqlFolder, 'template'))

    const introText = fs.readFileSync(path.join(docsGraphqlFolder, 'template', 'introText.html'))
    const indexContent = fs.readFileSync(path.join(docsGraphqlFolder, 'index.html'), 'utf8')
        .replace('API for module and article data', '')
        .replace('itemDefinition">', 'itemDefinition">' + introText)
        .replace(/Graphql schema documentation/g, 'Sagacious GraphQL API Documentation')

    fs.writeFile(
        path.join(docsGraphqlFolder, '/index.html'),
        indexContent
    )
}

if (require.main === module) {
    generateGraphqlDocs()
}


