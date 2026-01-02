import { query } from '../db/postgres.js';

const myFilmTable = 'films_mao523'
const myReviewTable = 'reviews_mao523'

const filmRoutes = (app) => {

// GET URL Path /films
app.get('/films', async(req, res) => {
  try {
    let qs = `SELECT * FROM ${myFilmTable}`
    query(qs).then(data => res.json(data.rows))
  } catch (err) {
    res.send('error', err)
  }
});

// POST path /films which expects a body containing title and body
app.post('/films', async (req, res) => {
  try {
    let body = req.body
    const now = new Date()
    let qs = `Insert into ${myFilmTable} (title, body, "date") values ('${body.title}', '${body.body}', '${now.toISOString().split('T')[0]}')`
    query(qs).then(data => res.send(`${data.rowCount} row updated`))
  } catch (err) {
    res.send('error', err)
  }
});

}



export default filmRoutes