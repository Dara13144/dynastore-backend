import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => data instanceof FormData ? api.put('/auth/me', data, { headers: { 'Content-Type': 'multipart/form-data' } }) : api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data)
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const movieAPI = {
  getHomeContent: () => api.get('/movies/home'),
  getMovies: (params) => api.get('/movies', { params }),
  getMovieBySlug: (slug) => api.get(`/movies/slug/${slug}`),
  toggleFavorite: (movieId) => api.post('/movies/favorite', { movieId }),
  getFavorites: () => api.get('/movies/favorites'),
  saveProgress: (data) => api.post('/movies/progress', data),
  addReview: (data) => api.post('/movies/review', data)
};

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  requestWithdraw: (data) => api.post('/wallet/withdraw', data),
  addBalance: (amount, targetUserId = null, description = '') => api.post('/wallet/add-balance', { amount, targetUserId, description })
};

export const paymentAPI = {
  createPayment: (amount, orderId = null) => api.post('/payments/cutluy/create', { amount, orderId }),
  createCutLuyPayment: (amount, orderId = null, description = '') => api.post('/payments/cutluy/create', { amount, orderId, description }),
  createABAPayment: (amount, orderId = null) => api.post('/payments/aba/create', { amount, orderId }),
  createABAKHQR: (amount, orderId = null) => api.post('/payments/cutluy/create', { amount, orderId }),
  createBakongKHQR: (amount, orderId = null) => api.post('/payments/cutluy/create', { amount, orderId }),
  createKhqrCcQR: (amount, orderId = null, remark = '', successUrl = '') => api.post('/payments/cutluy/create', { amount, orderId, description: remark, successUrl }),
  createKhqrCcCheckout: (amount, orderId = null, remark = '', successUrl = '') => api.post('/payments/khqr-cc/checkout', { amount, orderId, remark, successUrl }),
  checkStatus: (transactionId) => api.get(`/payments/status/${transactionId}`),
  checkABAStatus: (transactionId) => api.get(`/payments/status/${transactionId}`),
  checkBakongStatus: (transactionId) => api.get(`/payments/status/${transactionId}`),
  listTransactions: (params) => api.get('/payments/aba/list', { params })
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrderById: (id) => api.get(`/orders/${id}`),
  purchaseMovie: (data) => api.post('/orders/purchase', data),
  purchaseAllAccessPass: (data = {}) => api.post('/orders/vip-all-access', data),
  createVipPaymentOrder: (data = {}) => api.post('/orders/vip-payment-order', data),
  getUserOrders: () => api.get('/orders/my-orders'),
  getUserPurchases: () => api.get('/orders/my-purchases'),
  clearAllOrders: () => api.delete('/orders/clear'),
  deleteOrder: (id) => api.delete(`/orders/${id}`)
};

export const podcastAPI = {
  getPodcasts: (params) => api.get('/podcasts', { params }),
  likePodcast: (id) => api.post(`/podcasts/${id}/like`)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  createPodcast: (data) => api.post('/admin/podcasts', data),
  updatePodcast: (id, data) => api.put(`/admin/podcasts/${id}`, data),
  deletePodcast: (id) => api.delete(`/admin/podcasts/${id}`),
  getUsers: () => api.get('/admin/users'),
  adjustBalance: (data) => api.post('/admin/users/balance', data),
  getUserTransactions: (userId) => api.get(`/admin/users/transactions/${userId}`),
  updateUserRole: (data) => api.post('/admin/users/role', data),
  getPayments: () => api.get('/admin/payments'),
  updatePaymentStatus: (data) => api.put('/admin/payments/status', data),
  clearAllPayments: () => api.delete('/admin/payments/clear'),
  deletePayment: (id) => api.delete(`/admin/payments/${id}`)
};

export const uploadAPI = {
  uploadFile: (formData, onProgress = null) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }),
  uploadVideo: (formData, onProgress = null) =>
    api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
};

export const supabaseAPI = {
  getStatus: () => api.get('/supabase/status'),
  getConfig: () => api.get('/supabase/config'),
  getBuckets: () => api.get('/supabase/buckets'),
  createBucket: (name, isPublic = true) => api.post('/supabase/buckets/create', { name, isPublic }),
  uploadFile: (formData, onProgress = null) =>
    api.post('/supabase/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
};

