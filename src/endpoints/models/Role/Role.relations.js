
export default [
    [
        'belongsTo',
        'Translation',
        {
            as: 'name',
            foreignKey: 'nameId'
        }
    ],
    [
        'belongsTo',
        'Group',
        {
            foreignKey: 'ownedByGroupId',
            as: 'ownedByGroup'
        }
    ]
]

