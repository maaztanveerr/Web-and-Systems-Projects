//test.js
const BASE_URL = 'http://localhost:3000';
    
// from here on, i am testing every route in a simple way

// first i make sure the tables exist so the rest does not fail
let response = await fetch(BASE_URL + '/dev/init');
if (!response.ok) {
    throw new Error('GET /dev/init failed');
}
let initJson = await response.json(); // just confirming it worked

// now i create one film i control for the rest of the tests
// the server should assign FilmID and Date
let newFilm = { title: 'Citizen Kane', body: 'Rosebud!' };
response = await fetch(BASE_URL + '/films', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newFilm)
});
if (response.status !== 201) {
    throw new Error('POST /films should return 201');
}
let createdFilm = await response.json();
if (typeof createdFilm.FilmID !== 'number') {
    throw new Error('FilmID should be a number');
}
let filmId = createdFilm.FilmID; // i will reuse this id to hit other routes tied to this film

// i list all films and expect an array
response = await fetch(BASE_URL + '/films');
if (!response.ok) {
    throw new Error('GET /films failed');
}
let filmsList = await response.json();
if (!Array.isArray(filmsList)) {
    throw new Error('GET /films did not return an array');
}

// i search films using the query string; still expect an array
response = await fetch(BASE_URL + '/films?search=Citizen');
if (!response.ok) {
    throw new Error('GET /films?search failed');
}
let filmsSearch = await response.json();
if (!Array.isArray(filmsSearch)) {
    throw new Error('films search did not return an array');
}

// i fetch that single film; it should include a Reviews array (even if empty)
// this confirms the response shape matches the spec
response = await fetch(BASE_URL + '/films/' + filmId);
if (!response.ok) {
    throw new Error('GET /films/:film_id failed');
}
let filmWithReviews = await response.json();
if (filmWithReviews.FilmID !== filmId) {
    throw new Error('film id mismatch from GET /films/:film_id');
}
if (!Array.isArray(filmWithReviews.Reviews)) {
    throw new Error('film object should include a Reviews array');
}

// i update the film; i expect the server to return the updated film back
let updateFilmBody = { title: 'Citizen Kane (Updated)', body: 'Still Rosebud.' };
response = await fetch(BASE_URL + '/films/' + filmId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateFilmBody)
});
if (!response.ok) {
    throw new Error('PUT /films/:film_id failed');
}
let updatedFilm = await response.json();
if (updatedFilm.Title !== 'Citizen Kane (Updated)') {
    throw new Error('film title did not update as expected');
}

// i create one review for this film; server should assign ReviewID and Date
let newReviewBody = { title: 'Hot take', body: 'it is about a sled.' };
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReviewBody)
});
if (response.status !== 201) {
    throw new Error('POST /films/:film_id/reviews should return 201');
}
let createdReview = await response.json();
if (typeof createdReview.ReviewID !== 'number') {
    throw new Error('ReviewID should be a number');
}
let reviewId = createdReview.ReviewID; // i will use this to test single review routes

// i list reviews for the film; should be an array
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews');
if (!response.ok) {
    throw new Error('GET /films/:film_id/reviews failed');
}
let reviewsList = await response.json();
if (!Array.isArray(reviewsList)) {
    throw new Error('reviews list was not an array');
}

// i search reviews with a query; still expect an array
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews?search=sled');
if (!response.ok) {
    throw new Error('GET /films/:film_id/reviews?search failed');
}
let reviewsSearch = await response.json();
if (!Array.isArray(reviewsSearch)) {
    throw new Error('reviews search was not an array');
}

// i get a single review and check that i got the right one back
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews/' + reviewId);
if (!response.ok) {
    throw new Error('GET /films/:film_id/reviews/:review_id failed');
}
let singleReview = await response.json();
if (singleReview.ReviewID !== reviewId) {
    throw new Error('review id mismatch from GET single review');
}

// i update that review; i expect the returned object to show the new title
let updateReviewBody = { title: 'Hotter take', body: 'ok, masterpiece.' };
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews/' + reviewId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateReviewBody)
});
if (!response.ok) {
    throw new Error('PUT /films/:film_id/reviews/:review_id failed');
}
let updatedReview = await response.json();
if (updatedReview.Title !== 'Hotter take') {
    throw new Error('review title did not update as expected');
}

// i delete the review; spec says 204 no content, so i only check the status code
response = await fetch(BASE_URL + '/films/' + filmId + '/reviews/' + reviewId, {
    method: 'DELETE'
});
if (response.status !== 204) {
    throw new Error('DELETE review should return 204');
}

// i delete the film; also expect 204 no content
response = await fetch(BASE_URL + '/films/' + filmId, { method: 'DELETE' });
if (response.status !== 204) {
    throw new Error('DELETE film should return 204');
}

// i try to create a bad film (missing fields); expect a 400 bad request
let badFilmBody = { title: '' };
response = await fetch(BASE_URL + '/films', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badFilmBody)
});
if (response.status !== 400) {
    throw new Error('POST /films missing fields should return 400');
}

// i request a film that does not exist; expect 404 not found
response = await fetch(BASE_URL + '/films/999999');
if (response.status !== 404) {
    throw new Error('GET missing film should return 404');
}

console.log('ALL TESTS PASSED');
