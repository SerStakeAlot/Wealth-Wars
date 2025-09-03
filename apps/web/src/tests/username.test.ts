import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Mock global objects
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(global, 'window', {
  value: { localStorage: localStorageMock }
});

describe('Username Feature', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should allow setting a valid username', async () => {
    // Import the store after mocking localStorage
    const { useGame } = await import('../app/lib/store');
    
    // Get the store instance
    const store = useGame.getState();
    
    // Test setting a valid username
    const result = await store.setUsername('testuser123');
    
    expect(result.success).toBe(true);
    expect(store.username).toBe('testuser123');
  });

  it('should reject invalid usernames', async () => {
    const { useGame } = await import('../app/lib/store');
    const store = useGame.getState();

    // Too short
    let result = await store.setUsername('ab');
    expect(result.success).toBe(false);
    expect(result.error).toContain('at least 3 characters');

    // Too long
    result = await store.setUsername('a'.repeat(25));
    expect(result.success).toBe(false);
    expect(result.error).toContain('less than 20 characters');

    // Invalid characters
    result = await store.setUsername('test@user');
    expect(result.success).toBe(false);
    expect(result.error).toContain('letters, numbers, underscores, and hyphens');

    // Empty username
    result = await store.setUsername('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject duplicate usernames', async () => {
    const { useGame } = await import('../app/lib/store');
    const store = useGame.getState();

    // Set first username
    await store.setUsername('testuser');
    
    // Try to set the same username (should work - same user)
    let result = await store.setUsername('testuser');
    expect(result.success).toBe(true);

    // Reset to simulate different user and try duplicate
    store.username = '';
    result = await store.setUsername('testuser');
    expect(result.success).toBe(false);
    expect(result.error).toContain('already taken');
  });

  it('should handle username case insensitivity', async () => {
    const { useGame } = await import('../app/lib/store');
    const store = useGame.getState();

    // Set username in lowercase
    await store.setUsername('testuser');
    
    // Reset to simulate different user
    store.username = '';
    
    // Try to set similar username in different case
    const result = await store.setUsername('TestUser');
    expect(result.success).toBe(false);
    expect(result.error).toContain('already taken');
  });
});