
function processWhereCondition(whereOptions) {
    const conditionList = []
    const opList = Object.values(sqlite.Op)
    Object.keys(whereOptions).map(key => {
        let condition;
        if (opList.includes(key)) {
            condition = genOpStr(key, null, whereOptions[key])
        } else if (typeof whereOptions[key] == 'object') {
            const obj = whereOptions[key]
            if (Object.keys(obj).length > 0) {
                const opName = Object.keys(obj)[0]
                condition = genOpStr(opName, key, obj[opName])
            }
        } else if (typeof whereOptions[key] == 'string') {
            condition = `${key} = '${whereOptions[key].replace(/'/g, "''")}'`
        } else if (whereOptions[key] instanceof Date) {
            condition = `${key} = '${whereOptions[key].toISOString()}'`
        } else {
            condition = `${key} = ${whereOptions[key]}`
        }
        condition && conditionList.push(condition)
    })
    return conditionList.join(' AND ')
}

function genConditionStr(options) {
    const { where, order, limit, offset, collate } = options
    let sql = ''
    if (where && Object.keys(where).length > 0) {
        sql += ` WHERE ` + processWhereCondition(where)
    }
    if (order && order.length > 0) {
        const orderConditionList = order.map(item => `${item[0]} ${item[1]}`)
        sql += ' ORDER BY ' + orderConditionList.join(', ')
    }
    if (limit) {
        sql += ` LIMIT ${limit}`
    }
    if (offset) {
        sql += ` OFFSET ${offset}`
    }
    if (collate) {
        sql += ` COLLATE ${collate}`
    }

    return sql
}

function genOpStr(op, key, value) {
    let val = value
    if (typeof val == 'string') {
        val = `'${val.replace(/'/g, "''")}'`
    } else if (val instanceof Date) {
        val = `'${val.toISOString()}'`
    } else if (Array.isArray(val)) {
        val = val.map(item => {
            if (typeof item == 'string') {
                return `'${item.replace(/'/g, "''")}'`
            } else if (item instanceof Date) {
                return `'${item.toISOString()}'`
            } else {
                return item
            }
        })
    }
    switch (op) {
        case '$eq':
            return `${key} = ${val}`
        case '$ne':
            return `${key} != ${val}`
        case '$gt':
            return `${key} > ${val}`
        case '$lt':
            return `${key} < ${val}`
        case '$gte':
            return `${key} >= ${val}`
        case '$lte':
            return `${key} <= ${val}`
        case '$is':
            return `${key} is ${val}`
        case '$between':
            return `${key} between ${val[0]} and ${val[1]}`
        case '$in':
            return `${key} in (${val.join(', ')})`
        case '$or': {
            const conditionList = []
            Object.keys(val).map(subKey => {
                const subVal = val[subKey]
                const r = processWhereCondition({ [subKey]: subVal })
                if (r.trim() != '') {
                    conditionList.push(r)
                }
            })
            return '(' + conditionList.join(' OR ') + ')'
        }
        case '$and': {
            const conditionList = []
            Object.keys(val).map(subKey => {
                const subVal = val[subKey]
                const r = processWhereCondition({ [subKey]: subVal })
                if (r.trim() != '') {
                    conditionList.push(r)
                }
            })
            return conditionList.join(' AND ')
        }
        default:
            return ''
    }
}

module.exports = {
    processWhereCondition,
    genConditionStr,
    genOpStr
}