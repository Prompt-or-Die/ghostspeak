/**
 * Security Manager - podAI Core
 * Implements comprehensive security protocols as defined in security_protocols.mdc
 */

import { createHash, randomBytes, pbkdf2, scryptSync } from 'crypto';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

// Security Configuration
export interface SecurityConfig {
  enableInputValidation: boolean;
  enableRateLimiting: boolean;
  enableAuditLogging: boolean;
  maxRequestSize: number;
  allowedOrigins: string[];
  requireAuthentication: boolean;
  sessionTimeoutMs: number;
  maxFailedAttempts: number;
  lockoutDurationMs: number;
}

// Security Event Types
export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = 'auth_success',
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_FAILURE = 'authz_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INPUT_VALIDATION_FAILURE = 'input_validation_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_INCIDENT = 'security_incident',
  SESSION_CREATED = 'session_created',
  SESSION_EXPIRED = 'session_expired',
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  error?: Error;
}

// Rate Limiting
interface RateLimitWindow {
  requests: number[];
  firstRequest: number;
  totalRequests: number;
  patterns: Map<string, number>;
}

interface RequestInfo {
  method: string;
  path: string;
  ip: string;
  userAgent: string;
}

// Secure Buffer for sensitive data
export class SecureBuffer {
  private data: Uint8Array;

  constructor(size: number) {
    if (size <= 0 || size > 1024 * 1024) { // Max 1MB
      throw new Error('Invalid buffer size');
    }
    this.data = new Uint8Array(size);
    crypto.getRandomValues(this.data);
  }

  static from(data: Uint8Array): SecureBuffer {
    const buffer = new SecureBuffer(data.length);
    buffer.data.set(data);
    return buffer;
  }

  compare(other: Uint8Array): boolean {
    if (this.data.length !== other.length) {
      return false;
    }

    // Constant-time comparison
    let diff = 0;
    for (let i = 0; i < this.data.length; i++) {
      diff |= this.data[i] ^ other[i];
    }
    return diff === 0;
  }

  getData(): Uint8Array {
    return new Uint8Array(this.data);
  }

  clear(): void {
    this.data.fill(0);
  }
}

// Comprehensive Security Manager
export class SecurityManager {
  private config: SecurityConfig;
  private rateLimitStore = new Map<string, RateLimitWindow>();
  private sessionStore = new Map<string, SessionData>();
  private auditLogger: AuditLogger;
  private incidentResponder: SecurityIncidentResponder;
  private cryptoManager: CryptoManager;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.auditLogger = new AuditLogger();
    this.incidentResponder = new SecurityIncidentResponder();
    this.cryptoManager = new CryptoManager();
  }

  // Authentication & Authorization
  async verifySignature(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: PublicKey
  ): Promise<boolean> {
    try {
      const verified = nacl.sign.detached.verify(
        message,
        signature,
        publicKey.toBytes()
      );

      await this.logSecurityEvent({
        type: verified ? SecurityEventType.AUTHENTICATION_SUCCESS : SecurityEventType.AUTHENTICATION_FAILURE,
        timestamp: Date.now(),
        details: { publicKey: publicKey.toString() },
        severity: verified ? 'low' : 'medium'
      });

      return verified;
    } catch (error) {
      await this.logSecurityEvent({
        type: SecurityEventType.AUTHENTICATION_FAILURE,
        timestamp: Date.now(),
        details: { publicKey: publicKey.toString(), error: (error as Error).message },
        severity: 'high',
        error: error as Error
      });
      return false;
    }
  }

  // Capability-based access control
  hasCapability(agentCapabilities: number, required: number): boolean {
    return (agentCapabilities & required) === required;
  }

  // Input Validation & Sanitization
  validateInput<T>(input: any, schema: ValidationSchema<T>): ValidationResult<T> {
    if (!this.config.enableInputValidation) {
      return { valid: true, sanitized: input as T };
    }

    try {
      // Check for injection attempts
      if (this.detectInjectionAttempt(input)) {
        this.logSecurityEvent({
          type: SecurityEventType.INPUT_VALIDATION_FAILURE,
          timestamp: Date.now(),
          details: { input: this.sanitizeForLogging(input), reason: 'injection_detected' },
          severity: 'high'
        });
        return { valid: false, error: 'Malicious input detected' };
      }

      // Sanitize input
      const sanitized = this.sanitizeInput(input);

      // Validate against schema
      const result = schema.validate(sanitized);
      if (!result.valid) {
        this.logSecurityEvent({
          type: SecurityEventType.INPUT_VALIDATION_FAILURE,
          timestamp: Date.now(),
          details: { input: this.sanitizeForLogging(input), error: result.error },
          severity: 'medium'
        });
        return result;
      }

      return { valid: true, sanitized: result.data };
    } catch (error) {
      this.logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILURE,
        timestamp: Date.now(),
        details: { error: (error as Error).message },
        severity: 'high',
        error: error as Error
      });
      return { valid: false, error: 'Validation failed' };
    }
  }

  private detectInjectionAttempt(input: any): boolean {
    const inputStr = JSON.stringify(input).toLowerCase();
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /[;&|`$()]/gi,
      /__proto__/gi,
      /constructor/gi,
      /prototype/gi,
      /\.\.\/|\.\.\\|%2e%2e/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(inputStr));
  }

  private sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/[<>]/g, '')
        .trim();
    } else if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    } else if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    return input;
  }

  private sanitizeForLogging(input: any): any {
    const str = JSON.stringify(input);
    // Truncate long inputs for logging
    return str.length > 200 ? str.substring(0, 200) + '...' : str;
  }

  // Advanced Rate Limiting
  async checkRateLimit(
    identifier: string,
    requestInfo: RequestInfo,
    limit: number = 60,
    windowMs: number = 60000
  ): Promise<RateLimitResult> {
    if (!this.config.enableRateLimiting) {
      return { allowed: true };
    }

    const now = Date.now();
    let window = this.rateLimitStore.get(identifier);

    if (!window) {
      window = {
        requests: [],
        firstRequest: now,
        totalRequests: 0,
        patterns: new Map()
      };
      this.rateLimitStore.set(identifier, window);
    }

    // Remove old requests
    window.requests = window.requests.filter(timestamp => now - timestamp < windowMs);

    // Analyze suspicious patterns
    const suspicionScore = this.analyzeSuspiciousPatterns(window, requestInfo, now);

    if (suspicionScore > 0.8) {
      await this.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        timestamp: now,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        details: { suspicionScore, requestInfo },
        severity: 'critical'
      });

      await this.incidentResponder.handleSuspiciousActivity({
        identifier,
        suspicionScore,
        requestInfo,
        timestamp: now
      });

      return {
        allowed: false,
        reason: 'suspicious_activity',
        suspicionScore,
        retryAfter: 3600000 // 1 hour
      };
    }

    // Check rate limit
    if (window.requests.length >= limit) {
      await this.logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        timestamp: now,
        ip: requestInfo.ip,
        details: { identifier, requests: window.requests.length, limit },
        severity: 'medium'
      });

      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        retryAfter: windowMs - (now - window.requests[0])
      };
    }

    // Allow request
    window.requests.push(now);
    window.totalRequests++;
    this.updatePatterns(window, requestInfo);

    return {
      allowed: true,
      remaining: limit - window.requests.length,
      resetTime: now + windowMs
    };
  }

  private analyzeSuspiciousPatterns(
    window: RateLimitWindow,
    requestInfo: RequestInfo,
    now: number
  ): number {
    let suspicionScore = 0;

    // Pattern 1: Extremely rapid requests
    const recentRequests = window.requests.filter(timestamp => now - timestamp < 1000);
    if (recentRequests.length > 10) {
      suspicionScore += 0.4;
    }

    // Pattern 2: Identical request patterns
    const patternKey = `${requestInfo.method}:${requestInfo.path}`;
    const patternCount = window.patterns.get(patternKey) || 0;
    if (patternCount > 50) {
      suspicionScore += 0.3;
    }

    // Pattern 3: Unusual user agent
    if (this.isUnusualUserAgent(requestInfo.userAgent)) {
      suspicionScore += 0.2;
    }

    return Math.min(suspicionScore, 1.0);
  }

  private isUnusualUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scanner/i,
      /curl/i,
      /wget/i,
      /python/i,
      /perl/i,
      /ruby/i,
      /php/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private updatePatterns(window: RateLimitWindow, requestInfo: RequestInfo): void {
    const patternKey = `${requestInfo.method}:${requestInfo.path}`;
    const count = window.patterns.get(patternKey) || 0;
    window.patterns.set(patternKey, count + 1);
  }

  // Session Management
  createSession(agentId: string, capabilities: number): string {
    const sessionId = this.cryptoManager.generateSessionId();
    const session: SessionData = {
      id: sessionId,
      agentId,
      capabilities,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      failedAttempts: 0
    };

    this.sessionStore.set(sessionId, session);

    this.logSecurityEvent({
      type: SecurityEventType.SESSION_CREATED,
      timestamp: Date.now(),
      userId: agentId,
      details: { sessionId, capabilities },
      severity: 'low'
    });

    return sessionId;
  }

  validateSession(sessionId: string): SessionValidationResult {
    const session = this.sessionStore.get(sessionId);
    if (!session || !session.isActive) {
      return { valid: false, reason: 'session_not_found' };
    }

    const now = Date.now();
    const isExpired = now - session.lastActivity > this.config.sessionTimeoutMs;

    if (isExpired) {
      session.isActive = false;
      this.sessionStore.delete(sessionId);

      this.logSecurityEvent({
        type: SecurityEventType.SESSION_EXPIRED,
        timestamp: now,
        userId: session.agentId,
        details: { sessionId },
        severity: 'low'
      });

      return { valid: false, reason: 'session_expired' };
    }

    session.lastActivity = now;
    return { valid: true, session };
  }

  // Security Event Logging
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (this.config.enableAuditLogging) {
      await this.auditLogger.logSecurityEvent(event);
    }
  }

  // Generate Security Report
  generateSecurityReport(): SecurityReport {
    const now = Date.now();
    const windowMs = 3600000; // 1 hour

    const recentEvents = this.auditLogger.getRecentEvents(windowMs);
    const activeSessions = Array.from(this.sessionStore.values()).filter(s => s.isActive).length;
    const rateLimitedClients = Array.from(this.rateLimitStore.entries())
      .filter(([_, window]) => now - window.firstRequest < windowMs).length;

    return {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics: {
        activeSessions,
        rateLimitedClients,
        recentEvents: recentEvents.length,
        criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
        highSeverityEvents: recentEvents.filter(e => e.severity === 'high').length
      },
      recentIncidents: recentEvents.filter(e => e.severity === 'critical' || e.severity === 'high'),
      systemHealth: this.assessSystemHealth(recentEvents)
    };
  }

  private assessSystemHealth(events: SecurityEvent[]): 'healthy' | 'warning' | 'critical' {
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;

    if (criticalEvents > 0) return 'critical';
    if (highEvents > 5) return 'warning';
    return 'healthy';
  }
}

// Supporting Classes and Interfaces

interface SessionData {
  id: string;
  agentId: string;
  capabilities: number;
  createdAt: number;
  lastActivity: number;
  isActive: boolean;
  failedAttempts: number;
}

interface ValidationSchema<T> {
  validate(input: any): ValidationResult<T>;
}

interface ValidationResult<T> {
  valid: boolean;
  sanitized?: T;
  data?: T;
  error?: string;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  suspicionScore?: number;
  retryAfter?: number;
  remaining?: number;
  resetTime?: number;
}

interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: SessionData;
}

interface SecurityReport {
  timestamp: string;
  config: SecurityConfig;
  metrics: {
    activeSessions: number;
    rateLimitedClients: number;
    recentEvents: number;
    criticalEvents: number;
    highSeverityEvents: number;
  };
  recentIncidents: SecurityEvent[];
  systemHealth: 'healthy' | 'warning' | 'critical';
}

// Crypto Manager
class CryptoManager {
  generateSessionId(): string {
    const array = randomBytes(32);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  generateNonce(): Uint8Array {
    return randomBytes(32);
  }

  computeHash(data: Uint8Array): Uint8Array {
    return createHash('blake2b512').update(data).digest();
  }

  async encryptData(data: Uint8Array, key: Uint8Array): Promise<EncryptedData> {
    const nonce = this.generateNonce();
    // Implementation would use actual encryption library
    return {
      ciphertext: data, // Placeholder
      nonce,
      tag: new Uint8Array(16)
    };
  }
}

interface EncryptedData {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
}

// Audit Logger
class AuditLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000;

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.events.push(event);

    // Keep only recent events to prevent memory overflow
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2);
    }

    // In production, this would write to persistent storage
    console.log(`[SECURITY] ${event.type}: ${JSON.stringify(event.details)}`);
  }

  getRecentEvents(windowMs: number): SecurityEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.events.filter(event => event.timestamp > cutoff);
  }
}

// Security Incident Responder
class SecurityIncidentResponder {
  async handleSuspiciousActivity(incident: any): Promise<void> {
    // Implementation would handle various incident types
    console.log(`[INCIDENT] Suspicious activity detected:`, incident);
  }
}

export default SecurityManager; 