#![deny(clippy::all)]

use rusqlite::{ types::Value, Connection, Result};
use serde::Serialize;
use serde_json;
use std::collections::HashMap;

#[macro_use]
extern crate napi_derive;

#[derive(Serialize)]
#[serde(untagged)]
enum DataType {
    Integer(i64),
    Real(f64),
    String(String),
    Null(Option<String>),
}


#[napi(js_name = "RSQLite")]
pub struct RSQLite {
    connection: Option<Connection>,
}

#[napi]
impl RSQLite {
    #[napi(constructor)]
    pub fn new() -> Self {
        RSQLite { connection: None }
    }

    #[napi]
    pub fn open(&mut self, path: String) -> napi::Result<()> {
        let result = Connection::open(path);
        match result {
            Ok(conn) => {
                self.connection = Some(conn);
                return Ok(());
            }
            Err(error) => {
                return Err(napi::Error::new(napi::Status::GenericFailure, error.to_string()));
            }
        };
    }

    #[napi]
    pub fn exec(&self, sql: String ) -> napi::Result<i32> {
        if let Some(conn) = &self.connection {
            let amount = conn.execute(&sql, ()).map_err(|error| napi::Error::new(napi::Status::GenericFailure, error.to_string()))?;
            return Ok(amount as i32);
        } else {
            return Err(napi::Error::new(napi::Status::GenericFailure, String::from("database not opened.")));
        }
    }

    #[napi]
    pub fn query(&self, sql: String) -> napi::Result<String> {
        if let Some(conn) = &self.connection {
            let mut stmt = conn.prepare(&sql).map_err(|error| napi::Error::new(napi::Status::GenericFailure, error.to_string()))?;

            let column_count = stmt.column_count();
            let column_names = stmt.column_names().to_vec();
            let mut new_names = Vec::new();
            let mut result_vec = Vec::new();

            for i in &column_names {
                new_names.push(format!("{}", i));
            }

            let rows = stmt.query_map([], |row| {
                let values: Vec<Value> = (0..column_count)
                    .map(|i| row.get(i))
                    .collect::<Result<_>>()?;
                Ok(values)
            }).map_err(|error| napi::Error::new(napi::Status::GenericFailure, error.to_string()))?;

            for row in rows {
                let values = row.map_err(|error| napi::Error::new(napi::Status::GenericFailure, error.to_string()))?;
                let mut item = HashMap::new();
                for (index, value) in values.iter().enumerate() {
                    let name = new_names.get(index).unwrap();
        
                    match value {
                        Value::Null => {
                            item.insert(name, DataType::Null(None));
                        }
                        Value::Integer(i) => {
                            item.insert(name, DataType::Integer(*i));
                        }
                        Value::Real(f) => {
                            item.insert(name, DataType::Real(*f));
                        }
                        Value::Text(s) => {
                            item.insert(name, DataType::String(s.to_string()));
                        }
                        _ => println!("Unsupport type"), // Value::Blob(b) => println!("Blob: {:?}", b),
                    }
                }
        
                result_vec.push(item);
            }
        
            // 将Vec转换为JSON字符串
            let json = serde_json::to_string(&result_vec).unwrap();
        
            return Ok(json);
        } else {
            return Err(napi::Error::new(napi::Status::GenericFailure, String::from("database not opened")));
        }
    }

}