
export default [
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'groupId'
        }
    ],
    [
        'belongsTo',
        'Article',
        {
            foreignKey: 'articleId'
        }
    ]
]
