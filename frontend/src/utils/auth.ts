export type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return String(getStoredUser()?.role ?? "").toLowerCase() === "admin";
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function saveLogin(token: string, user: any) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("authChanged"));
}