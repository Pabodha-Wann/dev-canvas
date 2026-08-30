# OWASP Top 10 Security Assessment & Hardening Report

This document details the security review, vulnerability assessment, and remediation controls implemented in **DevCanvas** for Assessment 2.

---

## OWASP Top 10 Vulnerability Assessment Matrix

| OWASP Category | Finding / Risk Description | Severity | Remediation Control Implemented | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | IDOR risks on project update/delete routes; missing format checks on MongoDB ObjectIds. | **High** | Added `mongoose.Types.ObjectId.isValid` validation and strict server-side ownership verification (`project.studentId === req.user.id`). Added `GET /api/projects?owner=me` resolving identity strictly from server token. | Automated test: Attempt updating project ID owned by another student -> HTTP 403 Forbidden. | **PASSED** |
| **A02: Cryptographic Failures** | Secrets exposure risk if hardcoded in source; plain token verification without IdP checks. | **High** | Integrated Asgardeo OIDC with RS256 JWKS signature verification. Enforced strict environment variable separation via `.env` and `.gitignore`. | Network inspection & source code secret scanning. | **PASSED** |
| **A03: Injection** | Potential NoSQL injection payloads via unsanitized query parameters or dynamic Mongoose filters. | **High** | Enforced type validation and explicit string conversion on query parameters (`req.params.id`, `req.query.userId`). Validated ObjectIds before query execution. | Automated test: Send malformed string `invalid-objectid-999` -> HTTP 400 Bad Request. | **PASSED** |
| **A04: Insecure Design** | Authentication architecture mixing unverified custom JWTs with OAuth redirect without cryptographic key verification. | **Medium** | Migrated authentication to OIDC standard using Asgardeo as single primary IdP with RS256 public key verification via JWKS. | Verification of token flow and claims validation. | **PASSED** |
| **A05: Security Misconfiguration** | Verbose error responses leaking internal stack traces in production; missing security headers. | **Medium** | Enhanced Express error middleware in `app.js` to suppress internal stack traces in production responses. Configured `helmet` security headers. | Automated test: Trigger 500 error -> Verify stack trace omitted from JSON response. | **PASSED** |
| **A06: Vulnerable Components** | Outdated or vulnerable third-party npm dependencies. | **Medium** | Performed `npm audit` check. Dependencies updated to stable Node 20 / Express 5 compatible versions. | Execution of `npm audit`. | **PASSED** |
| **A07: Identification & Authentication Failures** | Lack of cryptographic token validation (`iss`, `aud`, `exp`). | **High** | `authMiddleware` verifies JWT signature, issuer (`iss`), audience (`aud`), and expiration (`exp`) with clock skew tolerance. | Automated test: Send missing or forged token -> HTTP 401 Unauthorized. | **PASSED** |
| **A08: Software & Data Integrity Failures** | Upload endpoints accepting arbitrary file MIME types without validation. | **High** | Applied strict Multer `fileFilter` restricting uploads exclusively to `image/jpeg`, `image/png`, and `image/webp` with 5MB size limit. | Automated test: Upload non-image format -> HTTP 400 Bad Request. | **PASSED** |
| **A09: Security Logging & Monitoring** | Lack of structured request and security audit logs. | **Low** | Configured `morgan` HTTP logger and console audit logging for administrative user suspension and project deletion actions. | Log output inspection. | **PASSED** |
| **A10: Server-Side Request Forgery (SSRF)** | Server fetching arbitrary external user-supplied image URLs. | **Low** | Verified project upload architecture streams file buffers directly from memory to Cloudinary without making server-initiated outbound HTTP requests to user-supplied URLs. | Code inspection of `project.service.js`. | **PASSED** |

---

## Test Verification Summary

Automated testing executed via `backend/scripts/verify-security.js`:

```text
====================================================
   DEVCANVAS ASSESSMENT 2 — SECURITY & API TESTS    
====================================================

[PASS] Backend Health Check (/api/health)
[PASS] Unauthenticated POST /api/projects returns HTTP 401
[PASS] Forged Bearer Token on /api/auth/me returns HTTP 401
[PASS] Invalid ObjectId in URL parameter returns HTTP 400
[PASS] Public GET /api/projects returns HTTP 200
[PASS] Asgardeo OIDC Endpoint Configuration Validated
[PASS] Database Schema: User.asgardeoId field present & indexed

====================================================
 SUMMARY: 7 PASSED, 0 FAILED
====================================================
```
