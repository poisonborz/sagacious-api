
export default [
    [
        'belongsTo',
        'User',
        {
            foreignKey: 'userId',
            as: 'user'
        }
    ]
]

