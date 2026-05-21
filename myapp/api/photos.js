const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const photoController = require('../controller/photoController');
const { route } = require('./routes.js');

const router = express.Router();
// /api/photos
// ── Multer config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  // Where to save the file
  destination: (req, file, cb) => {
    cb(null, 'views/uploads');
  },
  // What to name the file
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ── Routes ─────────────────────────────────────────────────────────────────
router.post('/', upload.single('photo'), photoController.uploadPhoto);
router.get('/:listing_id', photoController.getPhotosByListing);
router.delete('/:photo_id', photoController.deletePhoto);

// ── Multer error handler ───────────────────────────────────────────────────
// Must be defined after the routes so multer errors are caught here
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
  }
  if (err.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;