import fs from 'fs'
import test from 'ava'

import { RSQLite } from '../index.js'

const dbPath = './__test__.db'
async function openSQLite() {
    const sqlite = new RSQLite()
    await sqlite.open(dbPath)
    return sqlite;
}

test.serial('open sqlite', async (t) => {
    try {
        fs.unlinkSync(dbPath)
    } catch (e) {}
    
    await openSQLite()
    t.pass()
})

test.serial('create table', async (t) => {
    const sqlite = await openSQLite()
    await sqlite.exec(`DROP TABLE IF EXISTS "person";`)
    await sqlite.exec(`
    CREATE TABLE "person" (
        "id" INTEGER,
        "name" TEXT NOT NULL,
        "age" integer,
        PRIMARY KEY ("id")
    );
    `)
    t.pass()
})

test.serial('insert data', async (t) => {
    const sqlite = await openSQLite()
    let effectRows = await sqlite.exec(`
    INSERT INTO person (name, age) VALUES ('zhangsan', 5);
    `)
    t.is(effectRows, 1)

    effectRows = await sqlite.exec(`
    INSERT INTO person (name, age) VALUES ('lisi', 6);
    `)
    t.is(effectRows, 1)
})

test.serial('query data', async (t) => {
    const sqlite = await openSQLite()
    const res = await sqlite.query(`select * from person`)
    t.is(res.length, 2)
})


