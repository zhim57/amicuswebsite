# amicuswebsite

This repository contains the Node.js server and static files for the Amicus website. The app is built with Express to serve pages and handle file uploads.

## Installation

Install the dependencies, build the frontend assets, and start the server:

```bash
npm install
npm run build
npm start
```

By default the server listens on port `3000`. You can override this by setting
the `PORT` environment variable. The directory where uploaded files are stored
can also be configured via the `UPLOAD_DIR` environment variable; it defaults to
`uploads` inside the project root.

## Configuration

Copy `.env.example` to `.env` and adjust the values if you need to change the
server port or upload directory:

```bash
cp .env.example .env
# edit .env as needed
```

## Uploads

Uploaded files sent to `/upload` are saved inside the directory specified by `UPLOAD_DIR` (default is `uploads` in the project root). The server exposes this folder at `/uploads` so files can be accessed and listed via `/files`.

All HTML, CSS and client-side JavaScript files reside in the `public` directory which Express serves automatically. The home page and the resources page are now rendered with the EJS templating engine to avoid repeating markup.

## Templates

Dynamic pages live in the `views` directory and use [EJS](https://ejs.co/) for rendering. The server renders the index page at `/` and the resources list at `/resources`.

## Testing

Run the Jest test suite with:

```bash
npm test
```
