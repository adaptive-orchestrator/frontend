/**
 * JWT Utility Functions
 * Helper functions for working with JWT tokens
 */

/**
 * Decode JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload object
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get user role from JWT token
 * @param token - JWT token string
 * @returns User role ('user' | 'admin' | null)
 */
export function getRoleFromToken(token: string): 'user' | 'admin' | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

/**
 * Get user info from JWT token
 * @param token - JWT token string
 * @returns User info object
 */
export function getUserFromToken(token: string): {
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
} | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}
