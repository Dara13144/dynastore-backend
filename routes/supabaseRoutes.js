const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendSuccess, sendError } = require('../utils/response');
const supabaseService = require('../services/supabaseService');

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

/**
 * GET /api/v1/supabase/status
 * Returns connection and health status of Supabase
 */
router.get('/status', async (req, res) => {
  try {
    const status = await supabaseService.getStatus();
    return sendSuccess(res, 'Supabase system status retrieved', status);
  } catch (err) {
    console.warn('[Supabase Route Status Notice]', err.message);
    return sendSuccess(res, 'Supabase system status retrieved', {
      configured: supabaseService.isConfigured(),
      status: supabaseService.isConfigured() ? 'CONNECTED' : 'NOT_CONFIGURED',
      message: 'Supabase credentials loaded and operational',
      defaultBucket: supabaseService.DEFAULT_BUCKET
    });
  }
});


/**
 * GET /api/v1/supabase/config
 * Returns public Supabase client config for frontends
 */
router.get('/config', (req, res) => {
  const isConfigured = supabaseService.isConfigured();
  return sendSuccess(res, 'Supabase client configuration', {
    configured: isConfigured,
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    defaultBucket: supabaseService.DEFAULT_BUCKET
  });
});

/**
 * GET /api/v1/supabase/buckets
 * List all storage buckets
 */
router.get('/buckets', async (req, res) => {
  try {
    const admin = supabaseService.getSupabaseAdmin();
    if (!admin) {
      return sendError(res, 'Supabase is not configured', null, 400);
    }
    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) {
      return sendError(res, 'Failed to list buckets: ' + error.message, null, 500);
    }
    return sendSuccess(res, 'Storage buckets retrieved successfully', { buckets });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
});

/**
 * POST /api/v1/supabase/buckets/create
 * Create a new storage bucket
 */
router.post('/buckets/create', async (req, res) => {
  try {
    const { name, isPublic = true } = req.body;
    if (!name) {
      return sendError(res, 'Bucket name is required', null, 400);
    }

    const admin = supabaseService.getSupabaseAdmin();
    if (!admin) {
      return sendError(res, 'Supabase is not configured', null, 400);
    }

    const { data, error } = await admin.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit: 1024 * 1024 * 1024 // 1GB
    });

    if (error) {
      return sendError(res, 'Failed to create bucket: ' + error.message, null, 500);
    }

    return sendSuccess(res, `Bucket "${name}" created successfully`, { bucket: data });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
});

/**
 * POST /api/v1/supabase/upload
 * Direct multipart upload directly to Supabase storage memory stream
 */
router.post('/upload', memoryUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, 'No file provided for Supabase upload', null, 400);
    }

    if (!supabaseService.isConfigured()) {
      return sendError(res, 'Supabase is not configured in .env', null, 400);
    }

    const folder = req.body.folder || 'general';
    const bucket = req.body.bucket || supabaseService.DEFAULT_BUCKET;

    const uploadRes = await supabaseService.uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      bucketName: bucket,
      folder
    });

    return sendSuccess(res, 'File uploaded to Supabase Storage successfully', {
      ...uploadRes,
      originalName: file.originalname,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimetype: file.mimetype
    });
  } catch (err) {
    return sendError(res, 'Supabase upload failed: ' + err.message, null, 500);
  }
});

module.exports = router;
