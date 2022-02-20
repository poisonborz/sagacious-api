
export default [
    [
        'hasMany',
        'Article',
        {
            foreignKey: 'articleTypeId',
            as: 'articles'
        }
    ],
    [
        'belongsTo',
        'Translation',
        {
            foreignKey: 'nameId',
            as: 'name'
        }
    ],
    [
        'belongsTo',
        'ArticleCategory',
        {
            foreignKey: 'inArticleCategoryId',
            as: 'articleCategory'
        }
    ],
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'groupId',
            as: 'group'
        }
    ]
]
