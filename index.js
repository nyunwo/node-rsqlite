const { RSQLite } = require('./rsqlite')
const { genConditionStr, Op } = require('./utils')

class SQLite {
    constructor() {
        this.rsqlite = new RSQLite()
    }

    /**
     * 打开数据库
     * @param {*} path 数据库的相对或绝对路径
     */
    open(path) {
        return new Promise((resolve, reject) => {
            try{
                this.rsqlite.open(path)
                resolve()
            }catch(error){
                reject(error)
            }
        })
    }

    /**
     * 执行 SQL 语句
     * @param {*} sql SQL 语句
     * @returns 影响的记录数量
     */
    exec(sql) {
        return new Promise((resolve, reject) => {
            try {
                const effects = this.rsqlite.exec(sql)
                resolve(effects)
            } catch (error) {
                reject(error)
            }
        })
        
    }

    /**
     * 执行 SQL 查询
     * @param {*} sql 
     * @returns 查询结果
     */
    query(sql) {
        return new Promise((resolve, reject) => {
            try {
                const rows = this.rsqlite.query(sql)
                resolve(JSON.parse(rows))
            } catch (error) {
                reject(error)
            }
        })
        
    }

    /**
     * 查找所有数据
     * @param {*} tableName 数据表名
     * @param {*} options 查询条件
     * @returns 查询结果
     */
    async findAll(tableName, options) {
        if (options && !options.where) {
            throw new Error('missing where option')
        }
        if (!options) {
            options = {}
        }
        try {
            const { attributes } = options
            const cols = attributes ? attributes.join(', ') : '*'
            const sql = `SELECT ${cols} FROM ${tableName}` + genConditionStr(options)
            return await this.query(sql)
        } catch (e) {
            throw e
        }
    }

    /**
     * 查找一条数据
     * @param {*} tableName 数据表名
     * @param {*} options 查询条件
     * @returns 查询结果，查找不到记录则返回 null
     */
    async findOne(tableName, options) {
        if (options && !options.where) {
            throw new Error('missing where option')
        }

        if(options){
            options.limit = 1
        } else {
            options = { limit: 1, where: {} }
        }
        
        const result = await this.findAll(tableName, options)
        return result.length > 0 ? result[0] : null
    }

    /**
     * 删除数据
     * @param {*} tableName 数据表名
     * @param {*} options 查询条件
     * @returns 影响的记录数量
     */
    async destroy(tableName, options = {}) {
        if (!options.where || Object.keys(options.where) == 0) {
            throw new Error('missing where option')
        }
        const sql = `delete from ${tableName}` + genConditionStr(options)
        return await this.exec(sql)

    }

    /**
     * 插入一条数据
     * @param {*} tableName 数据表名
     * @param {*} data 要插入的数据
     * @returns 影响的记录数量
     */
    async create(tableName, data = {}) {
        const cols = Object.keys(data)
        const values = Object.values(data)
        const targetValues = cols.map(key => {
            const item = data[key]
            if (typeof item == 'string') {
                return `'${item.replace(/'/g, "''")}'`
            } else if (item instanceof Date) {
                return `'${item.toISOString()}'`
            } else if (item === null || item === undefined) {
                return 'null'
            } else {
                return item
            }
        })
        const sql = `INSERT INTO ${tableName}(${cols.join(', ')}) values(${targetValues.join(', ')});`
        return await this.exec(sql)
    }

    /**
     * 批量插入数据
     * @param {*} tableName 数据表名
     * @param {*} dataList 要插入的数据列表
     * @returns 影响的记录数量
     */
    async bulkCreate(tableName, dataList = []) {
        if(dataList.length == 0){
            return
        }
        const cols = Object.keys(dataList[0])
        let targetSQL = `INSERT INTO ${tableName}(${cols.join(', ')}) values `
        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i]
            const targetValues = cols.map(key => {
                const item = data[key]
                if (typeof item == 'string') {
                    return `'${item.replace(/'/g, "''")}'`
                } else if (item instanceof Date) {
                    return `'${item.toISOString()}'`
                } else if (item === null) {
                    return 'null'
                } else {
                    return item
                }
            })
            
            let sql = ''
            if (i != 0) {
                sql += ', '
            }
            sql += `(${targetValues.join(', ')})`
            targetSQL += sql
        }
        targetSQL += ';'
   
        return await this.exec(targetSQL)
    }

    /**
     * 更新数据
     * @param {*} tableName 数据表名
     * @param {*} updateData 要更新的数据
     * @param {*} options 查询条件
     * @returns 影响的记录数量
     */
    async update(tableName, updateData = {}, options = {}) {
        const updateList = []
        Object.keys(updateData).map(key => {
            let val = updateData[key]
            if (typeof val == 'string') {
                val = `'${val.replace(/'/g, "''")}'`
            } else if (val instanceof Date) {
                val = `'${val.toISOString()}'`
            } else if (val === null) {
                val = 'null'
            }
            updateList.push(`${key} = ${val}`)
        })

        if (updateList.length == 0) {
            return {
                lastInsertId: 0,
                rowsAffected: 0
            }
        }

        if (Object.keys(options).length == 0 || Object.keys(options.where) == 0) {
            throw new Error('missing where option')
        }

        const sql = `UPDATE ${tableName} SET ${updateList.join(', ')}` + genConditionStr(options)

        return await this.exec(sql)
    }

    /**
     * 获取一个数据表的对象
     * @param {*} tableName 数据表名 
     * @returns 数据表对象
     */
    table(tableName) {
        return {
            exec: (sql) => this.exec(sql),
            query: (sql) => this.query(sql),
            findAll: (options) => this.findAll(tableName, options),
            findOne: (options) => this.findOne(tableName, options),
            destroy: (options) => this.destroy(tableName, options),
            create: (data) => this.create(tableName, data),
            update: (updateData, options) => this.update(tableName, updateData, options),
            bulkCreate: (data) => this.bulkCreate(tableName, data),
        }
    }
}

module.exports.Op = Op
module.exports.RSQLite = SQLite
