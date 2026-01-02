# Job Application Tracker (Full Stack)

This project is a full-stack web application for tracking job applications. It lets you add applications, view them in a list/table, update status and notes over time, and delete entries when needed. The app uses a React frontend and an Express + PostgreSQL backend connected through a REST API.

## What I Built
- A React (Vite) client with a form to add job applications
- A table/list view that displays all job applications and refreshes after changes
- Editing support to update application status and notes
- Delete support with confirmation to prevent accidental removals
- A REST API server that performs CRUD operations against a PostgreSQL database
- Basic validation to ensure required fields are provided

## Tech Stack
- React (Vite)
- Node.js
- Express.js
- PostgreSQL
- Optional UI libraries: Material UI, Material React Table

## Core Features

### Add a Job Application
Users can create a new job application with:
- Company Name
- Position Title
- Status (Applied, Interviewing, Offer, Reject, etc.)
- Optional Notes
- Date Applied

Status is selected from a dropdown and Date Applied is selected using a date picker.

### View All Applications
- Displays all applications in a list or table
- Shows the relevant fields for each job
- Automatically updates after a new job is added or an existing job is edited or deleted

### Update Applications
- Users can update the job status and notes
- Optionally supports editing company name and position title depending on implementation

### Delete Applications
- Each job includes a delete action
- Prompts for confirmation before deletion

## REST API
The backend exposes a RESTful API:

- GET `/jobs`
- POST `/jobs`
- PUT `/jobs/:id`
- DELETE `/jobs/:id`

## Styling and UX
- Different statuses are visually distinguished
- Required fields are validated on the form
- Optional styling and small animations for a smoother user experience

## Notes and Limitations
- The frontend currently calls the backend using a hardcoded URL: `http://localhost:3000`.
- The backend table name is hardcoded in `app.js` as `applicationtracker_mat927`. In a polished public version, this would be a generic table name and created via migrations.
- This implementation focuses on updating status and notes. Editing company or position could be added as an enhancement.

## Possible Improvements
- Add filtering and sorting by status, date, and company
- Add analytics like counts by status and weekly application totals
- Add authentication so multiple users can track their own applications
- Add pagination if the list grows large

## How to Run

### Prerequisites
- Node.js installed
- Access to a PostgreSQL database

### 1) Set up environment variables
From the server folder, create a local `.env` file:
```bash
cp .env.example .env

Fill in your database credentials inside .env.

Important: Never commit .env.

Notes:

.env.example is safe to commit because it contains placeholders only.

.env must remain local and should be ignored by git to avoid leaking credentials.

2) Run the server

In the server directory:

npm install
npm run dev

This starts the API using nodemon.

3) Run the client

In the client directory:

npm install
npm run dev

This starts the React app (usually at http://localhost:5173).
