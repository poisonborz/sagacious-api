
export default [
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'belongsToGroupId',
            as: 'group'
        }
    ],
    [
        'belongsTo',
        'Role',
        {
            foreignKey: 'roleId',
            as: 'role'
        }
    ],
    [
        'belongsTo',
        'Language',
        {
            foreignKey: 'languageId',
            as: 'language'
        }
    ]
]

