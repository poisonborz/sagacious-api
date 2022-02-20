
export default [
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'parentGroupId',
            as: 'parentGroup'
        }
    ],
    [
        'hasMany',
        'Group',
        {
            foreignKey: 'parentGroupId',
            as: 'childGroups'
        }
    ],
    [
        'hasMany',
        'Role',
        {
            foreignKey: 'ownedByGroupId',
            as: 'roles'
        }
    ],
    [
        'hasMany',
        'User',
        {
            foreignKey: 'belongsToGroupId',
            as: 'users'
        }
    ],
    [
        'hasMany',
        'Article',
        {
            foreignKey: 'createdByGroupId',
            as: 'createdArticles'
        }
    ],
    [
        'belongsToMany',
        'Article',
        {
            through: 'ArticleToGroupAssignment',
            as: 'articles',
            foreignKey: 'groupId'
        }
    ],
    [
        'hasMany',
        'ArticleToGroupAssignment',
        {
            as: 'relatedGroup',
            foreignKey: 'groupId'
        }
    ],
    [
        'hasOne',
        'Group',
        {
            foreignKey: 'rootGroupId',
            as: 'rootGroup',
            where: {
                isRoot: null
            }
        }
    ]
]

