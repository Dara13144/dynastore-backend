import { io } from 'socket.io-client';

/**
 * Resolves the Socket.io server connection URL.
 * Automatically respects VITE_SOCKET_URL, strips API path from VITE_API_URL, or defaults to window origin.
 */
export const getSocketUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl && socketUrl.trim() !== '') {
    return socketUrl.trim();
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim() !== '') {
    try {
      const url = new URL(apiUrl.trim(), window.location.origin);
      return url.origin;
    } catch {
      return apiUrl.trim().replace(/\/api(\/v1)?\/?$/, '');
    }
  }
  if (import.meta.env.PROD) {
    return 'https://dynastore-backend.onrender.com';
  }
  return window.location.origin;
};

/**
 * Creates and returns a configured Socket.io instance.
 */
export const createSocket = (options = {}) => {
  const targetUrl = getSocketUrl();
  return io(targetUrl, {
    transports: ['websocket', 'polling'],
    ...options
  });
};
