import express from 'express'
import cors from 'cors'
import 'dotenv/config'


import { query } from './db/postgres.js';

const jobsTable = 'applicationtracker_mat927'

// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);
// set up some middleware to handle processing body requests
app.use(express.json())
// set up some midlleware to handle cors
app.use(cors())

// base route
app.get('/', (req, res) => {
  res.send("Welcome to the Job Application Tracker API!!!")
})


app.get('/up', (req, res) => {
  res.json({ status: 'up' })
})


app.get('/jobs', (req, res) => {
  const qs = `
    SELECT * FROM ${jobsTable}
    ORDER BY id DESC
  `

  query(qs)
    .then(data => {
      // array of job objects from database
      res.json(data.rows)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Error getting the jobs' })
    })
})

app.post('/jobs', (req, res) => {
  const body = req.body

  // basic checks 
  const company = body?.company || null
  const position = body?.position || null
  const status = body?.status || null
  const applied_on = body?.applied_on || null
  const notes = body?.notes || null

  //basic field check
  if (!company || !position || !status || !applied_on) {
    return res
      .status(400)
      .json({ error: 'company, position, status, and applied_on are necessary' })
  }

  // just placeholders until we have actual values
  const qs = `
    INSERT INTO ${jobsTable} 
      (company, position, status, applied_on, notes)
    VALUES
      ($1, $2, $3, $4, $5) 
    RETURNING *
  `

  const values = [company, position, status, applied_on, notes]

  query(qs, values)
    .then(data => {
      const insertedJob = data.rows[0] //new row
      res.status(201).json(insertedJob) //respond
    })
    .catch(err => {
      console.error(err) //error
      res.status(500).json({ error: 'Error Inserting Job' })
    })
})

app.put('/jobs/:id', (req, res) => {
  // id of the job we want to update
  const id = req.params.id;

  const body = req.body;

  // fields we allow to update per the spec as only status and notes are updateable
  const status = body?.status
  const notes = body?.notes

  // if they didn't send either field, there's nothing to do
  if (!status && !notes) {
    return res
      .status(400)
      .json({ error: 'Please send at least status or notes to update' })
  }

  // building the sql based on what is sent to us
  let qs
  let values

  if (status && notes) { // if both are available then we update both
    qs = `
      UPDATE ${jobsTable}
      SET status = $1, notes = $2
      WHERE id = $3
      RETURNING *
    `
    values = [status, notes, id]
  } else if (status) { //only update status 
    qs = `
      UPDATE ${jobsTable}
      SET status = $1
      WHERE id = $2
      RETURNING *
    `
    values = [status, id]
  } else {
    //only update notes
    qs = `
      UPDATE ${jobsTable}
      SET notes = $1
      WHERE id = $2
      RETURNING *
    `
    values = [notes, id]
  }

  // run the query and handle result / errors
  query(qs, values)
    .then(data => {
      // if no rows were updated, the id doesn't exist
      if (data.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      const updatedJob = data.rows[0]
      res.json(updatedJob)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Error updating job' })
    })

})

app.delete('/jobs/:id', (req, res) => {
  // which job are we trying to delete
  const id = req.params.id

  const qs = `
    DELETE FROM ${jobsTable}
    WHERE id = $1
  `
  const values = [id]

  query(qs, values)
    .then(data => {
      // rowCount tells us how many rows were actually deleted
      if (data.rowCount === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      // simple JSON response to say "it worked"
      res.json({ success: true, deletedId: id })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Error deleting job' })
    })
})

app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});
