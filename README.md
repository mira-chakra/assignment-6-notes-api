# Assignment 6 — Notes REST API

## About my project

For this assignment, I chose **notes** as my resource. I built a REST API with Node.js and Express. I connected it to MongoDB Atlas with Mongoose, so my notes are saved in a database and stay there when I restart the server.

I can create a note, see all my notes, see one note, update a note, and delete a note. I also added checks for invalid information and missing notes.

## What I used

- Node.js and Express for the server and API routes
- MongoDB Atlas and Mongoose for saving notes
- Postman to send requests and check the API responses

## What I need

- Node.js 20 or later
- npm
- A MongoDB Atlas cluster and a database user

## How I install and run my project

1. I open a terminal in the `Notes_API_Project` folder.
2. I install the packages listed in `package.json`:

   ```powershell
   npm.cmd install
   ```

   In other terminals, I can use `npm install`.

3. I make a copy of `.env.example` and name the copy `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

4. In `.env`, I replace the example `MONGODB_URI` with my MongoDB Atlas connection string. I keep `PORT=3000`.
5. I start the development server:

   ```powershell
   npm.cmd run dev
   ```

   When it works, the terminal shows `Connected to MongoDB.` and `Notes API is listening on http://localhost:3000`.

I leave the terminal open while I use the API. To stop the server, I press **Ctrl+C**. In a terminal other than Windows PowerShell, I can run `npm run dev`.

## How I set up MongoDB Atlas

I create a database user, allow my current IP address in the Atlas project's network access list, and copy the connection string. I put the string in `.env` as `MONGODB_URI`. The database name used by this project is `notes_api`. MongoDB creates the database and the `notes` collection when I save the first note.

I do not upload `.env` to GitHub because it contains my database password. The `.env` file is listed in `.gitignore`. I include `.env.example` with a placeholder instead.

## My note data

Each note has:

- `title`: required text, up to 120 characters
- `body`: optional text
- `tags`: an optional list of text values

MongoDB adds `_id`, `createdAt`, and `updatedAt` to each saved note.

## My API routes

All routes use the `/api/notes` resource. For the examples below, I use this sample id: `672a1b2c3d4e5f6071829301`. The id returned by my own API will be different.

### 1. I list all notes — `GET /api/notes`

I send:

```text
GET http://localhost:3000/api/notes
```

Success response: **200 OK**

```json
[
  {
    "_id": "672a1b2c3d4e5f6071829301",
    "title": "Study REST APIs",
    "body": "Review routes and status codes.",
    "tags": ["web", "exam"],
    "createdAt": "2026-11-09T12:00:00.000Z",
    "updatedAt": "2026-11-09T12:00:00.000Z"
  }
]
```

### 2. I get one note — `GET /api/notes/:id`

I send `GET http://localhost:3000/api/notes/672a1b2c3d4e5f6071829301`.

- **200 OK** — the note is returned as JSON.
- **400 Bad Request** — the id format is invalid.
- **404 Not Found** — the id is valid, but the note does not exist.

### 3. I create a note — `POST /api/notes`

I send `Content-Type: application/json` with this body:

```json
{
  "title": "Study REST APIs",
  "body": "Review routes and status codes.",
  "tags": ["web", "exam"]
}
```

Success response: **201 Created**. The response includes the saved note, its `_id`, and its timestamps. If the title or another field is invalid, I receive **400 Bad Request** with an `error` message.

### 4. I replace a note — `PUT /api/notes/:id`

I send `PUT http://localhost:3000/api/notes/672a1b2c3d4e5f6071829301` with the full note body, like the POST example above.

- **200 OK** — the updated note is returned as JSON.
- **400 Bad Request** — the id or note data is invalid.
- **404 Not Found** — the note does not exist.

If I leave out `body` or `tags`, they become an empty string or an empty list.

### 5. I delete a note — `DELETE /api/notes/:id`

I send `DELETE http://localhost:3000/api/notes/672a1b2c3d4e5f6071829301`.

- **204 No Content** — the note was deleted; the response has no body.
- **400 Bad Request** — the id format is invalid.
- **404 Not Found** — the note does not exist.

## How I handle errors

Invalid information and malformed JSON return a JSON error message. An unexpected server error returns **500 Internal Server Error**. A path that is not an API route returns **404 Not Found**.

Example error response:

```json
{ "error": "title is required and must be a non-empty string." }
```

## How I test my API

I included my Postman collection here:

```text
postman/Assignment_6_Notes_API.postman_collection.json
```

I import this file into Postman and send the requests in the collection. The collection checks the success responses and common error responses. The create request saves the returned note id as `noteId`, so the get, update, and delete requests can use it. The collection's `baseUrl` is `http://localhost:3000`.

I can also check the list route in my browser at `http://localhost:3000/api/notes` or from a terminal:

```bash
curl -i http://localhost:3000/api/notes
```

## Project files

```text
Notes_API_Project/
├── models/
│   └── Note.js
├── postman/
│   └── Assignment_6_Notes_API.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## How I upload it to GitHub

I create a **new, empty GitHub repository** called `assignment-6-notes-api`. From this project folder, I run these commands and replace `YOUR-USERNAME` with my GitHub username:

```bash
git init
git add .
git commit -m "Build Assignment 6 Notes REST API"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/assignment-6-notes-api.git
git push -u origin main
```

For submission, I provide my GitHub repository link and the ZIP file. The GitHub repository must be different from the repositories I used for my other assignments.
