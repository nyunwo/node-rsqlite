import test from 'ava'

import { sum, RSQLite } from '../index.js'

test('open sqlite', (t) => {
    let sqlite = new RSQLite()
    sqlite.open("./test.db")
    t.pass()
})

test('create table', (t) => {
    let sqlite = new RSQLite()
    sqlite.open("./test.db")
    sqlite.exec(`DROP TABLE IF EXISTS "person";`)
    sqlite.exec(`
    CREATE TABLE "person" (
        "id" INTEGER,
        "name" TEXT NOT NULL,
        "age" integer,
        PRIMARY KEY ("id")
    );
    `)
    t.pass()
})

test('insert data', (t) => {
    let sqlite = new RSQLite()
    sqlite.open("./test.db")
    sqlite.exec(`
    INSERT INTO person (name, age) VALUES ('zhangsan', 5);
    `)
    sqlite.exec(`
    INSERT INTO person (name, age) VALUES ('lisi', 6);
    `)
    t.pass()
})

test('query data', (t) => {
    let sqlite = new RSQLite()
    sqlite.open("./test.db")
    const res = sqlite.query(`select * from person`)
    const json = JSON.parse(res)
    console.log("查询结果：", json)
    t.is(json.length, 2)
})