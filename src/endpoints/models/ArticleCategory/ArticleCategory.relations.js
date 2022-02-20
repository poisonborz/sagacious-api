
export default [
    [
        'hasMany',
        'Article',
        {
            foreignKey: 'articleCategoryId',
            as: 'articles'
        }
    ],
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'groupId',
            as: 'group'
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
        'hasMany',
        'ArticleType',
        {
            foreignKey: 'inArticleCategoryId',
            as: 'articleTypes'
        }
    ]
]

