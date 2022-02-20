
export default [
    [
        'belongsTo',
        'ArticleType',
        {
            foreignKey: 'articleTypeId',
            as: 'articleType'
        }
    ],
    [
        'belongsTo',
        'ArticleCategory',
        {
            foreignKey: 'articleCategoryId',
            as: 'articleCategory'
        }
    ],
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'createdByGroupId',
            as: 'createdByGroup'
        }
    ],
    [
        'belongsTo',
        'Translation',
        {
            foreignKey: 'descriptionId',
            as: 'description'
        }
    ],
    [
        'belongsToMany',
        'Group',
        {
            through: 'ArticleToGroupAssignment',
            as: 'assignedToGroup',
            foreignKey: 'articleId'
        }
    ],
    [
        'hasMany',
        'ArticleToGroupAssignment',
        {
            foreignKey: 'articleId',
            as: 'AssignedGroup'
        }
    ],
    [
        'hasMany',
        'ArticleToGroupAssignment',
        {
            foreignKey: 'articleId',
            as: 'relatedGroups'
        }
    ]
]

