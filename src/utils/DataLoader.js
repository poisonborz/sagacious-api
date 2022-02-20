
export const sortAndFill = (result, sortedKeys, key) => {
    const resMap = mapKeyToRow(result, key)
    return sortedKeys
        .map(currentKey => resMap.has(String(currentKey)) && resMap.get(String(currentKey)).length
            ? resMap.get(String(currentKey))[0]
            : null)
}

export const sortFillAndGroup = (result, sortedKeys, key) => {
    const resMap = mapKeyToRow(result, key)
    return sortedKeys
        .map(currentKey => resMap.has(String(currentKey)) ? resMap.get(String(currentKey)) : [])
}

export const mapKeyToRow = (result, key) => {
    const resMap = new Map()
    for (const row of result) {
        const rowKey = String(row[key])
        if (rowKey !== 'undefined') {
            if (!resMap.has(rowKey)) {
                resMap.set(rowKey, [])
            }
            resMap.get(rowKey).push(row)
        }
    }
    return resMap
}

export const groupBy = (list, key) => list.reduce(function (acc, next) {
    (acc[next[key]] = acc[next[key]] || []).push(next)
    return acc
}, {})
