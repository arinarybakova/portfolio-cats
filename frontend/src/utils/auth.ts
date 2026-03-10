export type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return String(user?.role).toUpperCase() === "ADMIN";
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}