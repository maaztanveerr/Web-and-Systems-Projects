// postgres.js
import dotenv from 'dotenv'
dotenv.config()  
import pg from 'pg'
const { Client } = pg
 
const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DBNAME,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false }

})

client.connect()

export const query = async (text) => {
    try{
        const now = new Date()
        console.log("query to be executed:", text)
        const res = await client.query(text)
        const now2 = new Date()
        console.log(`it took ${now2-now}ms to run`)
        return res
    } catch (err) {
        console.error("Problem executing query")
        console.error(err)
        throw err
    }
}

/* 
HOW TO USE
    query(qs).then(data) => {res.json(data.rows)}
*/

// this helper is like query(), but it supports parameters (values array) for $1, $2, ...
export async function queryParams(text, values) {
  // i want to measure how long the database call takes
  const startTime = new Date()

  try {
    // i am logging the sql text and how many parameters i am sending
    // i am NOT printing the actual parameter values to avoid leaking secrets
    let paramCount = 0
    if (values && values.length > 0) {
      paramCount = values.length
    }
    console.log('query to be executed:', text, 'param_count=' + paramCount)

    // deciding whether to call client.query with parameters or without
    // if values is provided AND has at least one item, i send both text and values.
    // otherwise i only send the text.
    let result
    const hasValues = Boolean(values && values.length > 0)
    if (hasValues) {
      result = await client.query(text, values)
    } else {
      result = await client.query(text)
    }

    const endTime = new Date()
    const elapsedMs = endTime - startTime
    console.log('it took ' + elapsedMs + 'ms to run')

    return result
  } catch (err) {
    // if something goes wrong talking to postgres, i want a clear message
    console.error('Problem executing parameterized query')
    console.error(err)
    throw err
  }
}
