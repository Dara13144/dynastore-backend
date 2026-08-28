import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  FolderPlus, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Server, 
  HardDrive, 
  ShieldCheck
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { supabaseAPI } from '../../api/endpoints';
import { toast } from 'react-toastify';

const AdminSupabase = () => {
  const [statusData, setStatusData] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFolder, setTargetFolder] = useState('media');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // New Bucket State
  const [newBucketName, setNewBucketName] = useState('');
  const [isBucketPublic, setIsBucketPublic] = useState(true);
  const [creatingBucket, setCreatingBucket] = useState(false);

  const fetchSupabaseInfo = async () => {
    try {
      setRefreshing(true);
      const [statusRes, configRes, bucketsRes] = await Promise.allSettled([
        supabaseAPI.getStatus(),
        supabaseAPI.getConfig(),
        supabaseAPI.getBuckets()
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value.data?.success) {
        setStatusData(statusRes.value.data.data);
      }

      if (configRes.status === 'fulfilled' && configRes.value.data?.success) {
        setConfigData(configRes.value.data.data);
      }

      if (bucketsRes.status === 'fulfilled' && bucketsRes.value.data?.success) {
        setBuckets(bucketsRes.value.data.data.buckets || []);
      }
    } catch (err) {
      console.error('Error loading Supabase info:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSupabaseInfo();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', targetFolder);

    try {
      setUploading(true);
      setUploadProgress(10);
      const res = await supabaseAPI.uploadFile(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      if (res.data && res.data.success) {
        setUploadedResult(res.data.data);
        toast.success('File uploaded to Supabase Storage!');
        setSelectedFile(null);
        fetchSupabaseInfo();
      } else {
        toast.error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Supabase upload error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    try {
      setCreatingBucket(true);
      const res = await supabaseAPI.createBucket(newBucketName.trim().toLowerCase(), isBucketPublic);
      if (res.data && res.data.success) {
        toast.success(`Bucket "${newBucketName}" created!`);
        setNewBucketName('');
        fetchSupabaseInfo();
      } else {
        toast.error(res.data?.message || 'Failed to create bucket');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setCreatingBucket(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    toast.success('Copied URL to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isConnected = statusData?.status === 'CONNECTED';
  const isConfigured = statusData?.configured || configData?.configured;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <AdminNav
        title="Supabase Cloud Architecture"
        subtitle="Manage Supabase PostgreSQL database connectivity, real-time channels, and high-speed Cloud CDN storage buckets."
        actionButton={
          <button
            onClick={fetchSupabaseInfo}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-xl hover:bg-emerald-600/30 transition-all text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        }
      />

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card 1 */}
        <div className="bg-slate-900/80 border border-gray-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Cloud className="w-6 h-6" />
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isConfigured
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </>
              ) : isConfigured ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Connecting
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Not Configured
                </>
              )}
            </span>
          </div>
          <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider">Supabase Storage</h3>
          <p className="text-2xl font-black text-white mt-1">
            {statusData?.details?.defaultBucket || 'dynastore-media'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {statusData?.message || 'High-performance S3-compatible cloud object storage'}
          </p>
        </div>

        {/* Status Card 2 */}
        <div className="bg-slate-900/80 border border-gray-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Prisma + SQLite/Postgres
            </span>
          </div>
          <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider">Database Engine</h3>
          <p className="text-2xl font-black text-white mt-1">PostgreSQL Ready</p>
          <p className="text-xs text-gray-400 mt-2">
            Full Prisma ORM sync with Supabase PostgreSQL connection pooler support.
          </p>
        </div>

        {/* Status Card 3 */}
        <div className="bg-slate-900/80 border border-gray-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
              JWT & DRM Shield
            </span>
          </div>
          <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider">Security & Policies</h3>
          <p className="text-2xl font-black text-white mt-1">Row-Level Security</p>
          <p className="text-xs text-gray-400 mt-2">
            Protected media streams, anti-recording DRM, and live webhook token verification.
          </p>
        </div>
      </div>

      {/* Storage & Uploader Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Supabase Direct Media Uploader */}
        <div className="bg-slate-900/80 border border-gray-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Supabase Cloud Uploader</h2>
                <p className="text-xs text-gray-400">Upload media (images, videos, game files) directly to Supabase CDN</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Destination Folder / Category
              </label>
              <select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="media">General Media (/media)</option>
                <option value="images">Posters & Banners (/images)</option>
                <option value="videos">4K Cinema & Trailers (/videos)</option>
                <option value="games">Game Archives & Downloads (/games)</option>
                <option value="podcasts">Podcasts & Audio (/podcasts)</option>
                <option value="avatars">User Avatars (/avatars)</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-800 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition-all bg-slate-950/50">
              <input
                type="file"
                id="supabase-file-upload"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="supabase-file-upload" className="cursor-pointer block space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop files'}
                </div>
                <p className="text-xs text-gray-500">
                  Supported: MP4, MKV, ZIP, RAR, EXE, APK, ISO, PNG, JPG, WebM (up to 1GB)
                </p>
              </label>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Uploading to Supabase...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? `Uploading (${uploadProgress}%)...` : 'Upload to Supabase Storage'}
            </button>
          </form>

          {uploadedResult && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> File Successfully Uploaded
                </span>
                <button
                  onClick={() => copyToClipboard(uploadedResult.url)}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? 'Copied' : 'Copy URL'}
                </button>
              </div>
              <p className="text-xs text-gray-300 font-mono break-all bg-black/50 p-2 rounded-lg">
                {uploadedResult.url}
              </p>
            </div>
          )}
        </div>

        {/* Buckets Management & Connection Settings */}
        <div className="space-y-6">
          {/* Storage Buckets List */}
          <div className="bg-slate-900/80 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Storage Buckets</h2>
                  <p className="text-xs text-gray-400">Active Supabase S3-Compatible Buckets</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {buckets.length > 0 ? (
                buckets.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-950 border border-gray-800/80 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="text-sm font-bold text-white font-mono">{b.name}</div>
                        <div className="text-[11px] text-gray-400">
                          {b.public ? 'Public CDN' : 'Private RLS'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-950/50 rounded-2xl border border-gray-800/60 text-gray-400 text-xs space-y-1">
                  <HardDrive className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                  <p className="font-semibold text-gray-300">Default Bucket: dynastore-media</p>
                  <p className="text-[11px] text-gray-500">Auto-created on first upload or configuration</p>
                </div>
              )}
            </div>

            {/* Create Bucket Form */}
            <form onSubmit={handleCreateBucket} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="New bucket name (e.g. trailers)"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                className="flex-1 bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={creatingBucket || !newBucketName.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Create
              </button>
            </form>
          </div>

          {/* Quick Environment Setup Guide */}
          <div className="bg-slate-900/80 border border-gray-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-theme-gold" />
              Supabase Configuration Guide (.env)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Add your Supabase project credentials in your root <code className="text-amber-300">.env</code> to activate automated high-speed cloud CDN uploads and PostgreSQL replication:
            </p>
            <div className="p-3 bg-black/80 rounded-xl font-mono text-[11px] text-emerald-400 border border-gray-800 space-y-1 overflow-x-auto">
              <div>SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"</div>
              <div>SUPABASE_ANON_KEY="[YOUR_ANON_PUBLIC_KEY]"</div>
              <div>SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"</div>
              <div>SUPABASE_STORAGE_BUCKET="dynastore-media"</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSupabase;
