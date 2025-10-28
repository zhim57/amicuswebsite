const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const dotenv= require('dotenv')

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    const allowed = /\.(pdf|jpg|jpeg|png|doc|docx|html|htm)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

function renderResources(req, res) {
  fs.readdir(uploadDir, (err, files) => {
    if (err) files = [];
    res.render('resources', { files });
  });
}

app.get('/resources', renderResources);
app.get('/index.html', (req, res) => res.redirect('/'));
app.get('/resources.html', (req, res) => res.redirect('/resources'));

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', (req, res) => {
  upload.single('file')(req, res, function(err) {
    if (err) {
      return res.status(400).send('Invalid file upload');
    }
    res.redirect('/resources');
  });
});

app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files);
  });
});

const PORT = process.env.PORT || 3016;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
