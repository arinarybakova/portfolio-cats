// test/utils/authHeader.ts
export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}