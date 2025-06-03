// src/utils/formatImageUrl.js
export const formatImageUrl = (url) => {
  if (!url) return '';
  const isProduction = import.meta.env.MODE === 'production';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (isProduction && url.includes('http://localhost:3001')) {
    return url.replace('http://localhost:3001', backendUrl);
  }

  return url;
};
