import express from 'express'
import dotenv from 'dotenv'
dotenv.config()  
import { query, queryParams } from './db/postgres.js'

const FILMS_TABLE = 'films_mat927'
const REVIEWS_TABLE = 'reviews_mat927'

// making the express app
const app = express()

//setting the port
app.set('port', process.env.PORT || 3000)

// adding builtin middleware to parse JSON data to use for post/put routes
app.use(express.json())

/// dev-only: make sure the two tables exist so tests can run
app.get('/dev/init', async (req, res) => {
    try {
      // films table: auto id, text fields, server timestamp
      await query(`
        CREATE TABLE IF NOT EXISTS ${FILMS_TABLE} (
          film_id    SERIAL PRIMARY KEY,
          title      TEXT NOT NULL,
          body       TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `)
  
      // reviews table: auto id, fk to films, delete reviews when film is deleted
      await query(`
        CREATE TABLE IF NOT EXISTS ${REVIEWS_TABLE} (
          review_id  SERIAL PRIMARY KEY,
          film_id    INTEGER NOT NULL REFERENCES ${FILMS_TABLE}(film_id) ON DELETE CASCADE,
          title      TEXT NOT NULL,
          body       TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `)
  
      // success: tables are ready
      res.json({ ok: true, msg: 'tables ready' })
    } catch (err) {
      // failed to create/verify tables (e.g., no CREATE permission)
      console.error('init failed:', err)
      res.status(500).json({ ok: false, error: 'init failed' })
    }
  })

// HELPERS
// small helper to convert a timestamp to the GMT string
// if it cannot convert for any reason, it returns null
function toGMTString(value) {
    var out = null
    if (value !== undefined && value !== null) {
        if (value instanceof Date) {
            out = value.toUTCString() // got this from stack overflow
        } else if (typeof value === 'string') {
            var d = new Date(value)
            if (!isNaN(d.getTime())) {
                out = d.toUTCString()
            }
        }
    }
    return out
}
// parse and validate a numeric id from URL params; if bad, send 400 and return null
function parseIdOr400(req, res, paramName, label) {
    var raw
    if (req && req.params) {
        raw = req.params[paramName]
    } else {
        raw = undefined
    }
    var id = Number(raw)
    if (isNaN(id)) {
        res.status(400).json({ error: label + ' must be a number' })
        return null
    }
    return id
}

// read title/body from req.body and validate; if missing, send 400 and return null
function readTitleBodyOr400(req, res) {
    var requestBody = req.body
    var title
    var body
    if (requestBody) {
        title = requestBody.title
        body = requestBody.body
    } else {
        title = undefined
        body = undefined
    }
    var titleMissing = (title === undefined || title === null || title === '')
    var bodyMissing = (body === undefined || body === null || body === '')
    if (titleMissing || bodyMissing) {
        res.status(400).json({ error: 'Missing required field(s): title, body' })
        return null
    }
    return { title: title, body: body }
}

// turn a films row into the response object (without reviews)
function filmRowToResponse(row) {
    var dateString = toGMTString(row.created_at)
    return {
        FilmID: row.film_id,
        Title: row.title,
        Body: row.body,
        Date: dateString
    }
}

// same as above but attach Reviews array we pass in
function filmRowWithReviews(row, reviewsArray) {
    var base = filmRowToResponse(row)
    base.Reviews = reviewsArray
    return base
}

// turn a reviews row into the response object
function reviewRowToResponse(row) {
    var dateString = toGMTString(row.created_at)
    return {
        ReviewID: row.review_id,
        Title: row.title,
        Body: row.body,
        Date: dateString
    }
}

// convert many review rows into array of response objects (uses a simple loop)
function reviewsRowsToOut(rows) {
    var out = []
    if (rows && rows.length > 0) {
        var i = 0
        while (i < rows.length) {
            var r = rows[i]
            out.push(reviewRowToResponse(r))
            i = i + 1
        }
    }
    return out
}

// quick existence check for films (clean 404s in review routes)
async function filmExists(filmId) {
    var r = await queryParams(`SELECT film_id FROM ${FILMS_TABLE} WHERE film_id = $1`, [filmId])
    var exists = false
    if (r && r.rows && r.rows.length > 0) {
        exists = true
    }
    return exists
}

// instead of separate app.get('/films') and app.post('/films'):
app.route('/films')
    .get(async function (req, res) { /* 
    GET /films
    if criteria provided, search by title OR body 
    otherwise return all films
 */

        try {
            // read query param explicitly
            var q = undefined
            if (req.query && typeof req.query.search === 'string') {
                q = req.query.search
            }

            // choose SQL based on whether search is present
            var sql
            var values
            var useSearch = false
            if (q !== undefined && q !== null && q !== '') {
                // using parameterized LIKE '%term%' to avoid injection
                sql = `SELECT film_id, title, body, created_at FROM ${FILMS_TABLE}
                        WHERE title LIKE $1 OR body LIKE $1
                        ORDER BY created_at DESC`;
                values = ['%' + q + '%']
                useSearch = true
            } else {
                sql = `SELECT film_id, title, body, created_at FROM ${FILMS_TABLE}
                ORDER BY created_at DESC`;
                values = []
                useSearch = false
            }

            // run the query
            var dbResult
            if (useSearch) {
                dbResult = await queryParams(sql, values)
            } else {
                dbResult = await query(sql)
            }

            // build response array using the helper
            var rows = dbResult.rows
            var out = []
            var i = 0
            while (i < rows.length) {
                var r = rows[i]
                out.push(filmRowToResponse(r))
                i = i + 1
            }

            res.json(out)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .post(async function (req, res) {
        // POST /films
        // need to create a new film. the database will generate film_id and created_at
        // also:
        //   1) client must NOT send FilmID/film_id in the POST body (server generates it)
        //   2) title and body are required. if missing then 400 Bad Request

        try {
            var requestBody = req.body

            // read and validate required fields
            var titleBody = readTitleBodyOr400(req, res)
            if (titleBody === null) {
                return
            }
            var title = titleBody.title
            var body = titleBody.body

            // if the client tries to send an id, we fail validation
            var filmIdProvided = undefined
            if (requestBody) {
                if ('FilmID' in requestBody) {
                    filmIdProvided = requestBody.FilmID
                }
                if ('film_id' in requestBody) {
                    filmIdProvided = requestBody.film_id
                }
            }
            if (filmIdProvided !== undefined && filmIdProvided !== null) {
                res.status(400).json({ error: 'Do not include film_id in POST; it is generated by the database' })
                return
            }

            // insert into the database now
            // use $1 and $2 placeholders and pass real values in the array.
            var insertSql = `INSERT INTO ${FILMS_TABLE} (title, body)
                 VALUES ($1, $2)
                 RETURNING film_id, title, body, created_at`;
            var insertValues = [title, body]
            var dbResult = await queryParams(insertSql, insertValues)

            // we expect exactly one row back because of RETURNING
            var row
            if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
                row = dbResult.rows[0]
            } else {
                res.status(500).json({ error: 'Insert did not return a row' })
                return
            }

            // build the response JSON like the spec (new films have no reviews yet)
            var responseJson = filmRowWithReviews(row, [])

            // send correct status and Location header
            res.status(201)
            res.set('Location', '/films/' + row.film_id)
            res.json(responseJson)

        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })



// group the id routes:
app.route('/films/:film_id')
    .get(async function (req, res) {
        /* 
       GET /films/:film_id
       return a single film INCLUDING its reviews
    */
        try {
            // validate the route parameter
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }

            // fetch the film itself
            var filmSql = `SELECT film_id, title, body, created_at
               FROM ${FILMS_TABLE} WHERE film_id = $1`
            var filmResult = await queryParams(filmSql, [filmId])
            if (!filmResult || !filmResult.rows || filmResult.rows.length === 0) {
                res.status(404).json({ error: 'Film not found' })
                return
            }
            var filmRow = filmResult.rows[0]

            // fetch the reviews for this film

            var revSql = `SELECT review_id, title, body, created_at
                        FROM ${REVIEWS_TABLE}
                        WHERE film_id = $1
                        ORDER BY created_at DESC`
            var revResult = await queryParams(revSql, [filmId])

            var reviewRows = []
            if (revResult && revResult.rows) {
                reviewRows = revResult.rows
            }
            var reviewsOut = reviewsRowsToOut(reviewRows)

            // build and send the final film object with reviews
            var filmOut = filmRowWithReviews(filmRow, reviewsOut)
            res.json(filmOut)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .put(async function (req, res) {
        /* 
       PUT /films/:film_id
       update an existing film (require both title and body)
       400 if bad id or missing fields, 404 if not found
    */
        try {
            // validate the route parameter
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }

            // read and validate body
            var titleBody = readTitleBodyOr400(req, res)
            if (titleBody === null) {
                return
            }
            var title = titleBody.title
            var body = titleBody.body

            // do the update (return the updated row so we can format response)
            var sql = `UPDATE ${FILMS_TABLE}
            SET title = $1, body = $2
            WHERE film_id = $3
            RETURNING film_id, title, body, created_at`
            var vals = [title, body, filmId]
            var dbResult = await queryParams(sql, vals)

            if (!dbResult || !dbResult.rows || dbResult.rows.length === 0) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            var row = dbResult.rows[0]
            var responseJson = filmRowWithReviews(row, []) // spec does not require reviews in PUT response
            res.json(responseJson)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .delete(async function (req, res) {
        /* 
       DELETE /films/:film_id
       delete a film. 204 if deleted, 404 if not found
        */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }

            var sql = `DELETE FROM ${FILMS_TABLE} WHERE film_id = $1`;
            var result = await queryParams(sql, [filmId])

            var nothingDeleted = true
            if (result && result.rowCount && result.rowCount > 0) {
                nothingDeleted = false
            }
            if (nothingDeleted) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            // successful delete, no body required
            res.status(204).end()
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })


// group the review collection:
app.route('/films/:film_id/reviews')
    .get(async function (req, res) {
        /* 
       GET /films/:film_id/reviews
       list all reviews for a film (supports ?search on title/body)
    */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }

            // 404 if film does not exist
            var exists = await filmExists(filmId)
            if (!exists) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            // optional search
            var q = undefined
            if (req.query && typeof req.query.search === 'string') {
                q = req.query.search
            }

            var sql
            var vals
            if (q !== undefined && q !== null && q !== '') {
                sql = `SELECT review_id, title, body, created_at
                FROM ${REVIEWS_TABLE}
                WHERE film_id = $1 AND (title LIKE $2 OR body LIKE $2)
                ORDER BY created_at DESC`
                vals = [filmId, '%' + q + '%']
            } else {
                sql = `SELECT review_id, title, body, created_at
                FROM ${REVIEWS_TABLE}
                WHERE film_id = $1
                ORDER BY created_at DESC`
                vals = [filmId]
            }

            var dbResult = await queryParams(sql, vals)
            var out = reviewsRowsToOut(dbResult.rows)
            res.json(out)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .post(async function (req, res) {
        /* 
       POST /films/:film_id/reviews
       create a review for a specific film. server generates review_id and created_at.
       do NOT allow client to send ReviewID/review_id. title and body required.
    */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }

            // make sure the film exists first (clean 404 instead of FK error)
            var exists = await filmExists(filmId)
            if (!exists) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            var requestBody = req.body
            var titleBody = readTitleBodyOr400(req, res)
            if (titleBody === null) {
                return
            }
            var title = titleBody.title
            var body = titleBody.body

            // reject if client tries to send any id for a review or a film_id in body
            var reviewIdProvided = undefined
            var filmIdInBody = false
            if (requestBody) {
                if ('ReviewID' in requestBody) {
                    reviewIdProvided = requestBody.ReviewID
                }
                if ('review_id' in requestBody) {
                    reviewIdProvided = requestBody.review_id
                }
                if ('film_id' in requestBody) {
                    filmIdInBody = true
                }
                if ('FilmID' in requestBody) {
                    filmIdInBody = true
                }
            }
            if (reviewIdProvided !== undefined && reviewIdProvided !== null) {
                res.status(400).json({ error: 'Do not include review_id in POST; it is generated by the database' })
                return
            }
            if (filmIdInBody) {
                res.status(400).json({ error: 'Do not include film_id in review POST body; use the URL' })
                return
            }

            var sql = `INSERT INTO ${REVIEWS_TABLE} (film_id, title, body)
                VALUES ($1, $2, $3)
                RETURNING review_id, title, body, created_at`
            var vals = [filmId, title, body]
            var dbResult = await queryParams(sql, vals)

            if (!dbResult || !dbResult.rows || dbResult.rows.length === 0) {
                res.status(500).json({ error: 'Insert did not return a row' })
                return
            }

            var row = dbResult.rows[0]
            var responseJson = reviewRowToResponse(row)

            res.status(201)
            res.set('Location', '/films/' + filmId + '/reviews/' + row.review_id)
            res.json(responseJson)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })


// group the single review:
app.route('/films/:film_id/reviews/:review_id')
    .get(async function (req, res) {
        /* 
       GET /films/:film_id/reviews/:review_id
       return a single review
    */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }
            var reviewId = parseIdOr400(req, res, 'review_id', 'review_id')
            if (reviewId === null) {
                return
            }

            // 404 if film does not exist
            var exists = await filmExists(filmId)
            if (!exists) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            var sql = `SELECT review_id, title, body, created_at
           FROM ${REVIEWS_TABLE}
           WHERE film_id = $1 AND review_id = $2`;
            var r = await queryParams(sql, [filmId, reviewId])

            if (!r || !r.rows || r.rows.length === 0) {
                res.status(404).json({ error: 'Review not found' })
                return
            }

            var out = reviewRowToResponse(r.rows[0])
            res.json(out)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .put(async function (req, res) {
        /* 
        PUT /films/:film_id/reviews/:review_id
        update a review (require both title and body)
        400 if bad ids or missing fields, 404 if not found
        */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }
            var reviewId = parseIdOr400(req, res, 'review_id', 'review_id')
            if (reviewId === null) {
                return
            }

            // 404 if film does not exist
            var exists = await filmExists(filmId)
            if (!exists) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            var titleBody = readTitleBodyOr400(req, res)
            if (titleBody === null) {
                return
            }
            var title = titleBody.title
            var body = titleBody.body

            var sql = `UPDATE ${REVIEWS_TABLE}
                    SET title = $1, body = $2
                    WHERE film_id = $3 AND review_id = $4
                    RETURNING review_id, title, body, created_at`
            var vals = [title, body, filmId, reviewId]
            var r = await queryParams(sql, vals)

            if (!r || !r.rows || r.rows.length === 0) {
                res.status(404).json({ error: 'Review not found' })
                return
            }

            var out = reviewRowToResponse(r.rows[0])
            res.json(out)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    .delete(async function (req, res) {
        /* 
       DELETE /films/:film_id/reviews/:review_id
       delete a review. 204 if deleted, 404 if not found
    */
        try {
            var filmId = parseIdOr400(req, res, 'film_id', 'film_id')
            if (filmId === null) {
                return
            }
            var reviewId = parseIdOr400(req, res, 'review_id', 'review_id')
            if (reviewId === null) {
                return
            }

            // 404 if film does not exist
            var exists = await filmExists(filmId)
            if (!exists) {
                res.status(404).json({ error: 'Film not found' })
                return
            }

            var r = await queryParams(
                `DELETE FROM ${REVIEWS_TABLE} WHERE film_id = $1 AND review_id = $2`,
                [filmId, reviewId]
              )

            var deletedNone = true
            if (r && r.rowCount && r.rowCount > 0) {
                deletedNone = false
            }
            if (deletedNone) {
                res.status(404).json({ error: 'Review not found' })
                return
            }

            res.status(204).end()
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })


// if the route doesnt exist return 404
app.use(function (req, res) {
    res.status(404).json({ error: 'Not Found' })
})

// start the HTTP server and log where it’s listening
app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});


  
