# Business Requirements Document (BRD)
## Project Name: CloakFlow

---

## 1. Problem Statement
Our organization receives substantial customer feedback, support tickets, and contact requests daily. A significant portion of these submissions accidentally contains sensitive **Personally Identifiable Information (PII)** and **Protected Health Information (PHI)** (such as credit card details, Social Security Numbers, healthcare member record numbers, emails, and phone numbers). 

Storing this raw information inside our general logs, analytics tools, or marketing databases violates core regulatory compliance frameworks:
* **GDPR**: Restricts storing raw personal identifier information without explicit consent.
* **HIPAA**: Prohibits unprotected persistence of PHI (Medical Record Numbers, National Provider Identifiers).
* **PCI-DSS**: Enforces strict security bounds regarding credit card numbers and primary account numbers (PAN).

---

## 2. Business Objective
Develop and deploy a self-contained, deterministic **PII Redaction & Feedback Routing Portal** called **CloakFlow** to:
1. Parse, identify, and scrub sensitive PII/PHI categories from incoming strings in a single pass.
2. Route the sanitized feedback to the appropriate internal targets (e.g. Marketing Database, Priority Support Database, General Feedback Database) using a **local keyword-based sentiment engine**.
3. **No External AI/LLM Dependency**: To eliminate data leak vectors and latency overheads, the entire pipeline must operate entirely offline within our boundaries, without querying third-party cloud-based LLM APIs.

---

## 3. Definition of Success
* **100% Offline Execution**: Zero API connections to outside entities.
* **Flawless Redaction**: 100% of defined PII is replaced with `[REDACTED]`. If a message contains multiple PII types (e.g. both a phone number and an email), both must be redacted concurrently in the same pass.
* **Correct Routing**: Customer submissions are routed accurately based on sentiment keyword scores (Positive, Negative, Neutral).
* **Security Hardening**: The portal is protected against brute-force attacks via rate limiting, secure HTTP headers, and strict payload size limits (50KB max).
* **Graceful Error Handling**: Input validation exceptions (empty queries) are returned as structured `400 Bad Request` messages. System failures are logged to a secure Winston transport, returning a clean `500 Internal Server Error` without crashing the application process.

---

## 4. Scope Boundaries

### In-Scope
* Development of a local regex-based redaction engine for 6 defined PII/PHI categories.
* Development of a local case-insensitive word-boundary sentiment classifier.
* Creation of an Express backend with security middleware (CORS, Helmet, Rate Limiter).
* Development of a React + Tailwind CSS dashboard visualizing scan metrics and chronological transaction logs.
* Production bundler setup generating a single-file server executable (`dist/server.cjs`).
* 100% test coverage using Vitest/Supertest for unit and integration routes.

### Out-of-Scope
* Integration with third-party LLMs (e.g. OpenAI, Anthropic, Gemini API).
* Direct persistence to actual physical SQL/NoSQL databases (mocked via an in-memory repository for this release).
* Authentication and user role access controls.

---

## 5. PII Definition Boundaries
The following 6 categories are explicitly defined as PII/PHI:
1. **Credit Card Numbers**: 13-16 digit numbers matching Visa, MasterCard, Amex, and Discover prefix rules, including optional space or dash separators.
2. **Email Addresses**: Standard alphanumeric strings containing `@` and a domain name.
3. **Social Security Numbers (SSN)**: Standard 9-digit formats formatted as `XXX-XX-XXXX` or `XXX XX XXXX`.
4. **Medical Record Numbers (MRN)**: Patient identifiers matching the prefix `MRN` followed by 6–12 alphanumeric characters (case-insensitive).
5. **Healthcare Identifiers (NPI)**: National Provider Identifiers matching the prefix `NPI` followed by a 10-digit number.
6. **Phone Numbers**: US and international phone formats incorporating country code prefixes (`+1`, `+44`), brackets, dashes, or spaces.

---

## 6. Data Boundaries & Audit Logs
* **Redaction Format**: Every detected instance of PII/PHI is replaced with the literal string `[REDACTED]`.
* **Zero Raw PII Storage**: At no point is the original unredacted text saved in the database or outputted in general Winston logs.
* **Audit Trail Fields**: Every feedback transaction generates an entry in the repository capturing:
  * `id`: Unique request ID (`req-` + 3 random hex bytes).
  * `timestamp`: ISO-8601 generation date.
  * `originalLength`: Input length in characters.
  * `sanitizedLength`: Scrubbed output length in characters.
  * `sentiment`: POSITIVE, NEGATIVE, or NEUTRAL.
  * `routingResult`: Database target.
  * `confidenceScore`: Sentiment confidence level.
  * `status`: COMPLETED or FAILED.
  * `detectedEntities`: Array of entity types redacted (e.g., `["EMAIL", "PHONE"]`).
  * `errorMessage`: Optional error description on failure.

---

## 7. Assumptions
* Incoming payloads use standard UTF-8 characters.
* Client clients run modern web browsers with ES module support.
* Node.js v18+ is available on target hosting platforms (e.g. Render).

---

## 8. Non-Functional Requirements (NFR)
* **Performance**: Scans and routing must complete in under **10ms** locally since there are no blocking network-dependent operations.
* **Reliability**: Decoupled Express app and server startup, wrapped in catching loops, ensuring **zero-crash** server runtime.
* **Security**: Enforces a maximum **50KB** payload limit to prevent Deny of Service (DoS) attacks on parser memory.
* **Testability**: 100% coverage on all sanitization algorithms, validation paths, database states, and routing handlers.
