type OptionWhere = Record<string, any>
type OrderItem = [string, string]

type Option = {
    /** 条件 */
    where: OptionWhere,
    /** 排序 */
    order?: Array<OrderItem>,
    /** 查询数量限制 */
    limit?: number,
    /** 偏移量 */
    offset?: number,
    /** 指定是否忽悠大小写等 */
    collate?: string,
}

type DataRow = Record<string, any>

type TableObject = {
    /**
     * 执行 SQL
     * @param sql SQL语句
     */
    exec(sql: string): Promise<number>
    
    /**
     * 查询数据
     * @param sql SQL语句
     */
    query(sql: string): Promise<string>
    
    /**
     * 查找多条数据
     * @param options 查询条件
     */
    findAll(options: Option): Promise<Array<DataRow>>
    
    /**
     * 查找一条数据
     * @param options 查询条件
     */
    findOne(options: Option): Promise<Array<DataRow>>

    /**
     * 删除数据
     * @param options 查询条件
     */
    destroy(options: Option): Promise<void>

    /**
     * 插入一条数据
     * @param data 数据内容
     */
    create(data: Record<string, any>): Promise<number>

    /**
     * 批量插入数据
     * @param dataList 数据列表
     */
    bulkCreate(dataList: Array<Record<string, any>>): Promise<number>

    /**
     * 更新数据
     * @param updateData 需更新的数据键值对
     * @param options 查询条件
     */
    update(updateData: Record<string, any>, options: Option): Promise<number>

}

/** 操作符 */
export declare const Op: {
    /** 等于 */
    eq: string;
    /** 不等于 */
    ne: string;
    /** 大于 */
    gt: string;
    /** 小于 */
    lt: string,
    /** 大于等于 */
    gte: string,
    /** 小于等于 */
    lte: string,
    /** 是否为（用于判断NULL） */
    is: string,
    /** 两值之间 */
    between: [number, number],
    /** 在一个数组中的值 */
    in: Array<number>,
    /** 符合多个条件中的一个 */
    or: any,
    /** 多个条件同时成立 */
    and: any,
};

export class RSQLite {
    constructor()
    
    /**
     * 打开数据库
     * @param path 数据库的相对或绝对路径
     */
    open(path: string): Promise<void>
    
    /**
     * 执行 SQL
     * @param sql SQL语句
     */
    exec(sql: string): Promise<number>
    
    /**
     * 查询数据
     * @param sql SQL语句
     */
    query(sql: string): Promise<string>
    
    /**
     * 查找多条数据
     * @param tableName 数据表名
     * @param options 查询条件
     */
    findAll(tableName: string, options: Option): Promise<Array<DataRow>>
    
    /**
     * 查找一条数据
     * @param tableName 数据表名
     * @param options 查询条件
     */
    findOne(tableName: string, options: Option): Promise<Array<DataRow>>

    /**
     * 删除数据
     * @param tableName 数据表名
     * @param options 查询条件
     */
    destroy(tableName: string, options: Option): Promise<void>

    /**
     * 插入一条数据
     * @param tableName 数据表名 
     * @param data 数据内容
     */
    create(tableName: string, data: Record<string, any>): Promise<number>

    /**
     * 批量插入数据
     * @param tableName 数据表名
     * @param dataList 数据列表
     */
    bulkCreate(tableName: string, dataList: Array<Record<string, any>>): Promise<number>

    /**
     * 更新数据
     * @param tableName 数据表名
     * @param updateData 需更新的数据键值对
     * @param options 查询条件
     */
    update(tableName: string, updateData: Record<string, any>, options: Option): Promise<number>

    /**
     * 获取一个表的对象
     * @param tableName 
     */
    table(tableName: string): TableObject
}