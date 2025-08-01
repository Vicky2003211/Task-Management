const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse');
const CsvData = require('../Models/CsvData');

// Generate unique file ID for task identification
const generateFileId = async () => {
  const lastRecord = await CsvData.findOne().sort({ Task_id: -1 }).lean();

  let nextId = 1;
  if (lastRecord && lastRecord.Task_id) {
    const baseId = lastRecord.Task_id.split('-')[0];
    if (/^\d+$/.test(baseId)) {
      nextId = parseInt(baseId) + 1;
    }
  }

  return nextId.toString().padStart(4, '0');
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Word, Excel, and CSV files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Single file upload
const uploadFile = async (req, res) => {
  try {
    upload.single('file')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large',
            error: 'File size must be less than 5MB'
          });
        }
        return res.status(400).json({
          message: 'Upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          message: 'File upload failed',
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded',
          error: 'Please select a file to upload'
        });
      }

      const isCsvFile = req.file.mimetype === 'text/csv' || req.file.originalname.toLowerCase().endsWith('.csv');
      
      let csvData = null;
      if (isCsvFile) {
        try {
          csvData = await parseAndStoreCsv(req.file.path, req.file.originalname);
        } catch (error) {
          return res.status(400).json({
            message: 'Error processing CSV file',
            error: error.message
          });
        }
      }

      const response = {
        message: 'File uploaded successfully',
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      };

      if (csvData) {
        response.csvData = {
          recordsProcessed: csvData.recordsProcessed,
          message: `CSV data processed and stored successfully. ${csvData.recordsProcessed} records added to database.`
        };
      }

      res.status(201).json(response);
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during upload',
      error: error.message
    });
  }
};

// Multiple file upload
const uploadMultipleFiles = async (req, res) => {
  try {
    upload.array('files', 5)(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large',
            error: 'Each file must be less than 5MB'
          });
        }
        return res.status(400).json({
          message: 'Upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          message: 'File upload failed',
          error: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: 'No files uploaded',
          error: 'Please select files to upload'
        });
      }

      const csvFiles = [];
      const regularFiles = [];
      
      for (const file of req.files) {
        const isCsvFile = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
        
        if (isCsvFile) {
          try {
            const csvData = await parseAndStoreCsv(file.path, file.originalname);
            csvFiles.push({
              originalName: file.originalname,
              recordsProcessed: csvData.recordsProcessed
            });
          } catch (error) {
            return res.status(400).json({
              message: 'Error processing CSV file',
              error: error.message
            });
          }
        } else {
          regularFiles.push({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
          });
        }
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        count: req.files.length,
        csvFiles: csvFiles,
        regularFiles: regularFiles
      });
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during upload',
      error: error.message
    });
  }
};

// Parse CSV and store data in MongoDB
const parseAndStoreCsv = async (filePath, originalFileName) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv.parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          const baseTaskId = await generateFileId();
          
          const csvDataArray = [];
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const taskId = `${baseTaskId}-${(i + 1).toString().padStart(3, '0')}`;
            
            csvDataArray.push({
              Task_id: taskId,
              firstName: row.FirstName || row.firstName || '',
              phone: row.Phone || row.phone || '',
              notes: row.Notes || row.notes || ''
            });
          }

          const savedData = await CsvData.insertMany(csvDataArray);
          
          resolve({
            success: true,
            recordsProcessed: savedData.length,
            data: savedData
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

module.exports = { upload: uploadFile, uploadMultiple: uploadMultipleFiles, parseAndStoreCsv };
