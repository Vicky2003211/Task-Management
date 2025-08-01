const multer = require('multer');
const path = require('path');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, XLSX and XLS files are allowed'), false);
  }
};

const storage = multer.memoryStorage(); // Store file in memory for processing

module.exports = multer({ storage, fileFilter });
