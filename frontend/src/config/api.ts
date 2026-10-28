// the desktop app injects the sidecar address at runtime, its port is picked on launch
export const API_BASE = window.__API_BASE__ || import.meta.env.VITE_API_BASE || ''
