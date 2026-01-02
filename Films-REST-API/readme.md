# Films REST API (Node, Express, PostgreSQL)

This project is a REST API that supports creating, reading, updating, deleting, and searching Films and their nested Reviews using Node.js, Express, and PostgreSQL. I also wrote an end to end JavaScript test script that hits every route and validates status codes and response shapes.

## What I Built
- CRUD API for films
- CRUD API for reviews under a film
- Search support using query strings for both films and reviews
- Input validation and clear error codes
- Server generated IDs and timestamps (clients cannot provide IDs)
- A dev-only init route that creates tables so tests can run quickly
- A plain JavaScript test runner that exercises every endpoint

## Tech Stack
- Node.js (ES Modules)
- Express
- PostgreSQL (pg)
- dotenv
- nodemon (dev)

## API Endpoints

### Films
- GET `/films`
  - Returns all films
  - Supports search: GET `/films?search=query` (searches title or body)
- POST `/films`
  - Creates a film (requires `title` and `body`)
  - Rejects client provided `FilmID` or `film_id`
- GET `/films/:film_id`
  - Returns a single film plus its Reviews array
- PUT `/films/:film_id`
  - Updates a film (requires `title` and `body`)
- DELETE `/films/:film_id`
  - Deletes a film
  - Reviews are deleted automatically via foreign key cascade

### Reviews
- GET `/films/:film_id/reviews`
  - Returns all reviews for a film
  - Supports search: GET `/films/:film_id/reviews?search=query` (searches title or body)
- POST `/films/:film_id/reviews`
  - Creates a review for a film (requires `title` and `body`)
  - Rejects client provided `ReviewID` or `review_id`
- GET `/films/:film_id/reviews/:review_id`
  - Returns a single review
- PUT `/films/:film_id/reviews/:review_id`
  - Updates a review (requires `title` and `body`)
- DELETE `/films/:film_id/reviews/:review_id`
  - Deletes a review

### Dev Utility
- GET `/dev/init`
  - Dev-only route that creates the films and reviews tables if they do not exist
  - Useful for local testing and quick resets

### Validation and Error Handling

- Missing required fields (title, body) returns 400 Bad Request

- Non-numeric film_id or review_id returns 400 Bad Request

- Missing film or review returns 404 Not Found

- Successful deletes return 204 No Content

- Database and server errors return 500 Internal Server Error

### How to Run
1) Install dependencies
- npm install

2) Create your .env
- cp .env.example .env

Fill in your Postgres credentials in .env.

Important: Do not commit .env.

3) Start the server

Dev mode (auto-restart):
- npm run dev

- Server runs at http://localhost:3000 unless you change PORT.

### Implementation Notes

- I used parameterized SQL ($1, $2, ...) for user input to reduce the risk of SQL injection.

- I added small helper functions in app.js to keep route handlers readable:
   - parse numeric IDs and return 400 if invalid
   - validate request bodies for required fields
   - convert timestamps to GMT string output
   - check film existence so review routes return clean 404 responses

- Reviews are linked to films through a foreign key, and ON DELETE CASCADE ensures reviews are removed when a film is deleted.

### Next Improvements I Would Make

- Add schema validation using a dedicated validation library

- Move all routes into separate router files consistently

- Add a real test framework (Jest or similar) and run tests automatically

- Add database migrations instead of creating tables in a dev route

## Response Format

### Film
```json
{
  "FilmID": 12,
  "Title": "Citizen Kane",
  "Body": "Rosebud!",
  "Date": "Wed, 24 Mar 2021 15:37:46 GMT",
  "Reviews": [
    {
      "ReviewID": 21,
      "Title": "Hot take",
      "Body": "it is about a sled.",
      "Date": "Wed, 24 Mar 2021 15:37:46 GMT"
    }
  ]
}

Review
{
  "ReviewID": 21,
  "Title": "Hot take",
  "Body": "it is about a sled.",
  "Date": "Wed, 24 Mar 2021 15:37:46 GMT"
}
