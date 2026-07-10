# CloakFlow 🛡️

CloakFlow is a production-grade, single-repository feedback sanitization and sentiment routing portal. It utilizes a React + Tailwind CSS v4 frontend dashboard integrated with an Express/Node.js backend server. 

All communications are typed with TypeScript, and inputs are validated using Zod schemas. CloakFlow identifies, replaces, and audits sensitive Personally Identifiable Information (PII) before routing feedback payloads to their resolved database endpoints based on keyword sentiment analysis.

---

## Features
1. **PII Masking**: Redacts Credit Cards (Visa, MC, Amex, Discover), Emails, Social Security Numbers (SSN), Medical Record Numbers (MRN), Healthcare NPIs, and Phone Numbers (US & International formats) in a single pass.
2. **Sentiment Analysis**: Categorizes feedback sentiment locally (`POSITIVE`, `NEGATIVE`, `NEUTRAL`) and routes the output to marketing, priority support, or general repositories.
3. **Responsive Dashboard**: Displays performance statistics (total scans, redactions, sentiment breakdown, average confidence) and tabular chronological audit logs.
4. **Resiliency & Limits**: Integrates Rate Limiting, Helmet headers, CORS policies, 50KB request limits, and centralized Express error handling to guarantee server uptime.

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   ```

---

## NPM Scripts

* `npm run dev`: Runs the development server on `http://localhost:3000` (or your configured `PORT`). It boots Express and mounts the hot-reloading Vite dev server as middleware.
* `npm run build`: Compiles the React SPA assets to `dist/client/` and bundles the Express backend server using esbuild to a single CommonJS file at `dist/server.cjs`.
* `npm run start`: Starts the compiled production server (`node dist/server.cjs`) which serves the built frontend statically and handles API endpoints.
* `npm run test`: Runs the Vitest test runner to execute all unit and integration test suites.
* `npm run lint`: Performs static TypeScript type checking (`tsc --noEmit`) to verify strict compiler compliance.

---

## API Documentation

### 1. Health Status Checks
Returns the service health status.

* **Endpoints**: 
  * `GET /health`
  * `GET /api/v1/health`
* **Response `200 OK`**:
  ```json
  {
    "status": "healthy"
  }
  ```

---

### 2. Feedback Analysis & Redaction
Validates the text feedback payload, scrubs PII, classifies sentiment, resolves target databases, logs progress, and persists results.

* **Endpoint**: `POST /api/v1/analyze`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "feedback": "Reach out at user@email.com or call 555-123-4567. Excellent service!"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "originalLength": 76,
    "sanitizedLength": 60,
    "sentiment": "POSITIVE",
    "routingTarget": "MARKETING_DATABASE",
    "sanitizedText": "Reach out at [REDACTED] or call [REDACTED]. Excellent service!",
    "confidenceScore": 1.0,
    "detectedEntities": ["EMAIL", "PHONE"],
    "requestId": "req-4ab2ef",
    "timestamp": "2026-07-10T12:00:00.000Z"
  }
  ```
* **Response `400 Bad Request`** (Validation failure):
  ```json
  {
    "error": "Validation Error",
    "issues": [
      {
        "field": "feedback",
        "message": "Feedback cannot be empty."
      }
    ]
  }
  ```

---

### 3. Retrieve Audit Logs
Retrieves the chronological list of all scanned transaction logs (most recent first).

* **Endpoint**: `GET /api/v1/logs`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "logs": [
      {
        "id": "req-4ab2ef",
        "timestamp": "2026-07-10T12:00:00.000Z",
        "originalLength": 76,
        "sanitizedLength": 60,
        "sentiment": "POSITIVE",
        "routingResult": "MARKETING_DATABASE",
        "confidenceScore": 1.0,
        "status": "COMPLETED",
        "detectedEntities": ["EMAIL", "PHONE"]
      }
    ]
  }
  ```

---

### 4. Retrieve Scan Statistics
Retrieves aggregated statistics summarizing counts and performance parameters across all scans.

* **Endpoint**: `GET /api/v1/stats`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "stats": {
      "totalRequests": 4,
      "totalSanitized": 3,
      "positiveFeedback": 2,
      "negativeFeedback": 1,
      "neutralFeedback": 1,
      "averageConfidenceScore": 0.88
    }
  }
  ```

---

## Deployment to Render
To deploy CloakFlow using the Render Blueprint spec, connect your repository to Render. Render will automatically read `render.yaml` to spin up a Free tier Node service using:
* **Build Command**: `npm install && npm run build`
* **Start Command**: `npm run start`
* **Port**: `3000`
