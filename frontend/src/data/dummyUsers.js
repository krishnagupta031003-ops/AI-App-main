/**
 * Dummy user data matching backend User schema
 * Backend schema: { name, email, password, role, refreshToken, lastLogin, createdAt, updatedAt }
 */

export const dummyUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-07-04T00:00:00.000Z',
    lastLogin: '2026-07-04T08:00:00.000Z',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user',
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-07-03T00:00:00.000Z',
    lastLogin: '2026-07-03T15:30:00.000Z',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2025-12-01T00:00:00.000Z',
    updatedAt: '2026-07-04T00:00:00.000Z',
    lastLogin: '2026-07-04T07:00:00.000Z',
  },
];

// Current logged-in user for demo
export const currentUser = dummyUsers[0];
