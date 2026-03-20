// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Dynamically set API_BASE based on environment
const getApiBase = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api/tasks'; // Local development
  }
  // For deployed environments, use the same domain
  const protocol = window.location.protocol; // http: or https:
  const host = window.location.host; // domain.com or domain.com:port
  return `${protocol}//${host}/api/tasks`;
};

const API_BASE = getApiBase();
