const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, admin } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype.includes('pdf') || file.mimetype.includes('document');

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and document files are allowed!'));
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
};

const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: documentFilter
});

const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: videoFilter
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `home/${folder}`,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { quality: 'auto', fetch_format: 'auto' }
        ] : undefined
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @route   POST /api/upload/image
// @desc    Upload single image to Cloudinary
// @access  Private
router.post('/image', protect, uploadImage.single('image'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.query:', req.query);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.query.folder || 'general';
    const result = await uploadToCloudinary(req.file.buffer, folder, 'image');

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images to Cloudinary
// @access  Private
router.post('/images', protect, uploadImage.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const folder = req.query.folder || 'general';
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, folder, 'image')
    );

    const results = await Promise.all(uploadPromises);
    const files = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes
    }));

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/upload/document
// @desc    Upload document (PDF, DOC) to Cloudinary
// @access  Private
router.post('/document', protect, uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.query.folder || 'documents';
    const result = await uploadToCloudinary(req.file.buffer, folder, 'raw');

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/upload/video
// @desc    Upload video to Cloudinary
// @access  Private/Admin
router.post('/video', protect, admin, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.query.folder || 'videos';
    const result = await uploadToCloudinary(req.file.buffer, folder, 'video');

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete file from Cloudinary
// @access  Private/Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/_/g, '/');
    const resourceType = req.query.type || 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
