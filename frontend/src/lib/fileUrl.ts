const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function fileUrl(path: string) {
  return `${API_ORIGIN}/${path}`;
}
