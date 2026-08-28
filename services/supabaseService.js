require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');


function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || getSupabaseAnonKey();
}

function getDefaultBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'dynastore-media';
}

let supabaseClient = null;
let supabaseAdmin = null;

function isConfigured() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const service = getSupabaseServiceRoleKey();
  return Boolean(url && (anon || service));
}

function getSupabaseClient() {
  if (!isConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey() || getSupabaseServiceRoleKey();
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

function getSupabaseAdmin() {
  if (!isConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey();
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

/**
 * Ensure storage bucket exists (creates if not found with public read access)
 */
async function ensureBucket(bucketName = getDefaultBucket()) {
  const admin = getSupabaseAdmin();
  if (!admin) return { success: false, message: 'Supabase is not configured' };

  try {
    const { data: buckets, error: listError } = await admin.storage.listBuckets();
    if (listError) {
      console.warn('[Supabase Storage] Error listing buckets:', listError.message);
      return { success: false, error: listError.message };
    }

    const exists = buckets.some(b => b.name === bucketName);
    if (!exists) {
      console.log(`[Supabase Storage] Creating public bucket: "${bucketName}"`);
      const { data, error: createError } = await admin.storage.createBucket(bucketName, {
        public: true
      });

      if (createError) {
        console.error('[Supabase Storage] Failed to create bucket:', createError.message);
        return { success: false, error: createError.message };
      }
      return { success: true, created: true, bucket: data };
    }
    return { success: true, exists: true };
  } catch (err) {
    console.error('[Supabase Storage Exception]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Upload a file Buffer directly to Supabase Storage
 */
async function uploadBuffer({ buffer, fileName, contentType, bucketName = getDefaultBucket(), folder = 'media' }) {
  const admin = getSupabaseAdmin() || getSupabaseClient();
  if (!admin) {
    throw new Error('Supabase credentials not configured in environment variables');
  }

  await ensureBucket(bucketName);

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = folder ? `${folder}/${Date.now()}_${cleanFileName}` : `${Date.now()}_${cleanFileName}`;

  const { data, error } = await admin.storage
    .from(bucketName)
    .upload(storagePath, buffer, {
      contentType: contentType || 'application/octet-stream',
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase Storage Upload Error: ${error.message}`);
  }

  const { data: publicUrlData } = admin.storage
    .from(bucketName)
    .getPublicUrl(storagePath);

  return {
    url: publicUrlData.publicUrl,
    path: storagePath,
    fullPath: data?.fullPath || `${bucketName}/${storagePath}`,
    bucket: bucketName,
    storage: 'supabase'
  };
}

/**
 * Upload a local file from disk to Supabase Storage
 */
async function uploadFileFromDisk(filePath, folder = 'media', bucketName = getDefaultBucket()) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  let contentType = 'application/octet-stream';
  if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.mp4') contentType = 'video/mp4';
  else if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.zip') contentType = 'application/zip';

  return await uploadBuffer({
    buffer,
    fileName,
    contentType,
    bucketName,
    folder
  });
}

/**
 * Delete a file from Supabase Storage
 */
async function deleteFile(storagePath, bucketName = getDefaultBucket()) {
  const admin = getSupabaseAdmin() || getSupabaseClient();
  if (!admin) return { success: false, message: 'Supabase not configured' };

  try {
    const { data, error } = await admin.storage.from(bucketName).remove([storagePath]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Check Supabase Connection Health and Storage status
 */
async function getStatus() {
  const configured = isConfigured();
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const service = getSupabaseServiceRoleKey();
  const defaultBucket = getDefaultBucket();

  if (!configured) {
    return {
      configured: false,
      status: 'NOT_CONFIGURED',
      message: 'Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY) are not set in .env',
      details: {
        urlSet: Boolean(url),
        anonKeySet: Boolean(anon),
        serviceRoleKeySet: Boolean(service),
        defaultBucket
      }
    };
  }

  const admin = getSupabaseAdmin();
  const startTime = Date.now();

  try {
    const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
    const latency = Date.now() - startTime;

    if (bucketError) {
      return {
        configured: true,
        status: 'CONNECTED_AUTH_ONLY',
        latencyMs: latency,
        message: `Supabase Connected (${bucketError.message})`,
        details: {
          url,
          error: bucketError.message,
          defaultBucket
        }
      };
    }

    return {
      configured: true,
      status: 'CONNECTED',
      latencyMs: latency,
      message: 'Supabase Cloud Storage and Client are active & operational',
      details: {
        url,
        buckets: buckets.map(b => ({
          name: b.name,
          public: b.public,
          createdAt: b.created_at
        })),
        defaultBucket
      }
    };
  } catch (err) {
    return {
      configured: true,
      status: 'EXCEPTION',
      message: err.message,
      details: { url }
    };
  }
}

module.exports = {
  isConfigured,
  getSupabaseClient,
  getSupabaseAdmin,
  ensureBucket,
  uploadBuffer,
  uploadFileFromDisk,
  deleteFile,
  getStatus,
  DEFAULT_BUCKET: 'dynastore-media',
  getDefaultBucket
};
