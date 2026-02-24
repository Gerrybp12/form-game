export const TOKEN_KEY = "fb_token";

export function getToken() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(^| )fb_token=([^;]+)/);
  return match ? match[2] : null;
}

export function setToken(token: string) {
  document.cookie = `fb_token=${token}; path=/`;
}

export function clearToken() {
  document.cookie = "fb_token=; Max-Age=0; path=/";
}