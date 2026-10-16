# TruthLens AI — REST API Documentation

All versioned endpoints are accessible under `/api/v1`.

## Authentication Endpoints

### 1. Register User
`POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Dr. Jane Doe",
    "email": "jane@university.edu",
    "password": "securePassword123"
  }
  ```
- **Response (201 Created):**
  Sets HTTP-only `token` cookie and returns:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": {
        "id": "65f0123...",
        "name": "Dr. Jane Doe",
        "email": "jane@university.edu",
        "role": "user"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2. Login User
`POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "jane@university.edu",
    "password": "securePassword123"
  }
  ```

### 3. Current User Profile
`GET /api/v1/auth/me`
- **Headers:** Cookie `token` or `Authorization: Bearer <token>`

---

## Analysis Endpoints

### 4. Analyze Text
`POST /api/v1/analyses/text`
- **Request Body:**
  ```json
  {
    "text": "The Ministry of Energy yesterday confirmed a new regulatory framework that will reduce electricity prices by 40%."
  }
  ```
- **Response (201 Created):**
  Returns analysis overview, atomic claims, retrieved evidence citations, stance classification, and calibrated confidence.

### 5. Analyze URL
`POST /api/v1/analyses/url`
- **Request Body:**
  ```json
  {
    "url": "https://reuters.com/business/energy/government-subsidy-announcement"
  }
  ```

### 6. Analyze Image (Screenshot OCR)
`POST /api/v1/analyses/image`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` (JPG, PNG, WebP; max 5MB)

### 7. Analyze Document
`POST /api/v1/analyses/document`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `document` (PDF or TXT; max 10MB, max 20 pages)

### 8. List User Analyses
`GET /api/v1/analyses?page=1&limit=10&search=keyword&status=completed`

### 9. Get Single Analysis Report
`GET /api/v1/analyses/:id`

### 10. Delete Analysis Report
`DELETE /api/v1/analyses/:id`

### 11. Export Report
`GET /api/v1/analyses/:id/export?format=json|html`

---

## User & Dashboard Endpoints

### 12. Dashboard Analytics
`GET /api/v1/dashboard`
- Aggregates total analyses, claims verified, status distribution (Pie data), and top topic categories.

### 13. Bookmark Report
`POST /api/v1/reports/:id/bookmark`
- **Request Body:**
  ```json
  {
    "notes": "Follow up on revised Q4 subsidy figures."
  }
  ```

### 14. Submit Feedback
`POST /api/v1/feedback`
- **Request Body:**
  ```json
  {
    "analysisId": "65f0123...",
    "claimId": "65f0456...",
    "feedbackType": "missing_contradiction",
    "description": "A relevant fact-check was published yesterday on AFP."
  }
  ```
