# amicuswebsite

This repository contains the Node.js server and static files for the Amicus website. The app is built with Express to serve pages and handle file uploads.

## Installation

Install the dependencies and start the server:

```bash
npm install
npm start
```

By default the server listens on port 3000.

## Uploads

Uploaded files sent to `/upload` are saved inside the `uploads` directory at the project root. The server exposes this folder at `/uploads` so files can be accessed and listed via `/files`.
