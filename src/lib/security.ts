/**
 * Security Utilities
 * Comprehensive security functions for SafariPlus application
 *
 * SECURITY FEATURES:
 * - Input sanitization (XSS prevention)
 * - CSRF token generation and validation
 * - Request signature verification
 * - SQL injection prevention helpers
 * - Secure error handling
 */

import crypto from "crypto"

// ==============================================================================
// XSS PREVENTION - Input Sanitization
// ==============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Strips all HTML tags except safe ones
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ""

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "")

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "")

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, "")

  return sanitized.trim()
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (!input) return ""

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * Sanitize user input for safe display
 * Use this for all user-generated content
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ""

  // First escape HTML entities
  let sanitized = escapeHtml(input)

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "")

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  return sanitized
}

// ==============================================================================
// CSRF PROTECTION
// ==============================================================================

/**
 * Generate a CSRF token
 * Uses cryptographically secure random bytes
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

/**
 * Validate CSRF token
 * Constant-time comparison to prevent timing attacks
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false

  try {
    const tokenBuffer = Buffer.from(token)
    const expectedBuffer = Buffer.from(expectedToken)

    // Ensure same length to prevent timing attacks
    if (tokenBuffer.length !== expectedBuffer.length) return false

    // Constant-time comparison
    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
  } catch {
    return false
  }
}

// ==============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ==============================================================================

/**
 * Generate HMAC signature for webhook verification
 * Used to verify that webhooks are from trusted sources
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

/**
 * Verify webhook signature
 * Constant-time comparison to prevent timing attacks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret)

  try {
    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (sigBuffer.length !== expectedBuffer.length) return false

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

// ==============================================================================
// SQL INJECTION PREVENTION
// ==============================================================================

/**
 * Validate and sanitize SQL-like input
 * NOTE: When using Prisma, parameterized queries are used automatically
 * This is an additional layer of defense for raw queries
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return ""

  // Remove SQL comment markers
  let sanitized = input.replace(/--/g, "")
  sanitized = sanitized.replace(/\/\*/g, "")
  sanitized = sanitized.replace(/\*\//g, "")

  // Remove semicolons (can be used to chain queries)
  sanitized = sanitized.replace(/;/g, "")

  return sanitized.trim()
}

/**
 * Validate identifier (table/column names)
 * Only allows alphanumeric characters and underscores
 */
export function validateIdentifier(identifier: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)
}

// ==============================================================================
// SECURE ERROR HANDLING
// ==============================================================================

/**
 * Sanitize error messages to prevent information leakage
 * Removes sensitive information like file paths, database details, etc.
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "An error occurred"

  let message = error instanceof Error ? error.message : String(error)

  // Remove file paths
  message = message.replace(/\/[\w\/.-]+\.(ts|js|tsx|jsx)/g, "[file path removed]")

  // Remove database connection strings
  message = message.replace(/postgresql:\/\/[^\s]+/g, "[database url removed]")
  message = message.replace(/mongodb:\/\/[^\s]+/g, "[database url removed]")

  // Remove API keys and secrets
  message = message.replace(/[A-Za-z0-9_-]{32,}/g, "[secret removed]")

  // Remove IP addresses
  message = message.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[ip removed]")

  // Remove email addresses from error messages
  message = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email removed]")

  return message
}

/**
 * Create safe error response for API endpoints
 * Prevents sensitive information leakage in production
 */
export function createSafeErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): { error: string; details?: string } {
  const isDevelopment = process.env.NODE_ENV === "development"

  if (isDevelopment) {
    // In development, show full error details
    return {
      error: defaultMessage,
      details: error instanceof Error ? error.message : String(error),
    }
  }

  // In production, show sanitized generic message
  return {
    error: defaultMessage,
  }
}

// ==============================================================================
// IP ADDRESS VALIDATION
// ==============================================================================

/**
 * Validate IP address format
 */
export function isValidIp(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex =
    /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
  if (ipv4Regex.test(ip)) return true

  // IPv6 validation (basic)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/
  if (ipv6Regex.test(ip)) return true

  return false
}

/**
 * Check if IP is in allowed IP range
 * Used for webhook IP validation
 */
export function isIpInRange(ip: string, allowedRanges: string[]): boolean {
  if (!isValidIp(ip)) return false

  for (const range of allowedRanges) {
    if (ip.startsWith(range)) return true
  }

  return false
}

/**
 * Extract real IP address from request headers
 * Handles proxy headers correctly
 */
export function getRealIp(request: Request): string {
  // Check various proxy headers in order of reliability
  const headers = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
    "x-client-ip",
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(",")[0].trim()
      if (isValidIp(ip)) return ip
    }
  }

  return "unknown"
}

// ==============================================================================
// PASSWORD SECURITY HELPERS
// ==============================================================================

/**
 * Validate password strength
 * Returns true if password meets security requirements
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  // Check for common passwords
  const commonPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "password123",
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ==============================================================================
// TIMING ATTACK PREVENTION
// ==============================================================================

/**
 * Constant-time string comparison
 * Prevents timing attacks on sensitive comparisons
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

// ==============================================================================
// SESSION SECURITY
// ==============================================================================

/**
 * Generate secure session ID
 */
export function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString("base64url")
}

/**
 * Generate device fingerprint for session validation
 */
export function generateDeviceFingerprint(request: Request): string {
  const userAgent = request.headers.get("user-agent") || ""
  const acceptLanguage = request.headers.get("accept-language") || ""
  const acceptEncoding = request.headers.get("accept-encoding") || ""

  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}`

  return crypto.createHash("sha256").update(fingerprintString).digest("hex")
}

// ==============================================================================
// FILE UPLOAD SECURITY
// ==============================================================================

/**
 * Validate file type based on magic bytes (file signature)
 * More secure than relying on file extension
 */
export function validateFileType(
  buffer: Buffer,
  allowedTypes: string[]
): boolean {
  const signatures: Record<string, string[]> = {
    jpg: ["ffd8ff"],
    jpeg: ["ffd8ff"],
    png: ["89504e47"],
    gif: ["474946"],
    pdf: ["25504446"],
    webp: ["52494646"],
  }

  const hex = buffer.toString("hex", 0, 4)

  for (const type of allowedTypes) {
    const validSignatures = signatures[type.toLowerCase()]
    if (validSignatures?.some((sig) => hex.startsWith(sig))) {
      return true
    }
  }

  return false
}

/**
 * Generate safe filename
 * Removes path traversal attempts and dangerous characters
 */
export function generateSafeFilename(filename: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, "")
  safe = safe.replace(/\//g, "")
  safe = safe.replace(/\\/g, "")

  // Remove dangerous characters
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, "_")

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split(".").pop()
    safe = safe.substring(0, 250) + "." + ext
  }

  // Add timestamp to prevent collisions
  const timestamp = Date.now()
  const nameParts = safe.split(".")
  const extension = nameParts.pop()
  const baseName = nameParts.join(".")

  return `${baseName}_${timestamp}.${extension}`
}
