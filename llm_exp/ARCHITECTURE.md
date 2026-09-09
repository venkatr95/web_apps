# System Architecture Documentation

## Overview

The UUID Form Filler Agent is a full-stack application that demonstrates AI-powered form filling using OpenAI's GPT models.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                             │
│                     (Browser - localhost:5173)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                        REACT FRONTEND                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Components:                                                  │  │
│  │  - UUIDComboBox: Input field + Dropdown selector            │  │
│  │  - FormFields: Auto-filled form display                     │  │
│  │  - App: Main application logic                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Layer (formApi.ts):                                     │  │
│  │  - fetchUUIDs(): Get all available UUIDs                    │  │
│  │  - fetchFormData(uuid): Get form data for UUID              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Axios HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                       FASTAPI BACKEND                               │
│                    (localhost:8000)                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Endpoints (main.py):                                    │  │
│  │  - GET  /api/uuids          : List all UUIDs                │  │
│  │  - POST /api/get-form-data  : Get form data by UUID         │  │
│  │  - GET  /api/health         : Health check                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                       │
│                             │                                       │
│  ┌──────────────────────────▼────────────────────────────────────┐ │
│  │               OpenAI Agent (agent.py)                        │ │
│  │  - Processes raw database data                               │ │
│  │  - Formats and validates fields                             │ │
│  │  - Enhances data with AI intelligence                       │ │
│  └──────────────────────────┬────────────────────────────────────┘ │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │                │
                    ┌─────────▼──────┐  ┌──────▼──────────┐
                    │  SQLite DB     │  │  OpenAI API     │
                    │ (uuid_forms)   │  │   (GPT-4o-mini) │
                    │  - FormData    │  │                 │
                    │  - Sessions    │  └─────────────────┘
                    └────────────────┘
```

## Data Flow

### 1. UUID Selection Flow

```
User Action → UUIDComboBox → API Request → FastAPI → Database Query
                                                    ↓
User sees data ← FormFields ← API Response ← OpenAI Agent ← Raw Data
```

### 2. Detailed Request Flow

1. **User selects UUID** (from dropdown or manual input)
2. **Frontend validates** UUID format
3. **Axios sends POST** to `/api/get-form-data`
4. **FastAPI receives** request with UUID
5. **SQLAlchemy queries** SQLite database
6. **Database returns** raw form data
7. **OpenAI Agent processes** data:
   - Validates each field
   - Formats professionally
   - Adds context/improvements
   - Returns structured JSON
8. **FastAPI sends** formatted response
9. **Frontend receives** data via Axios
10. **React updates** form fields automatically

## Component Interactions

### Frontend Components

```
App.tsx
├── State Management
│   ├── uuids: string[]
│   ├── selectedUUID: string
│   ├── formData: FormData
│   └── loading/error states
│
├── UUIDComboBox
│   ├── Input field (manual entry)
│   ├── Dropdown button
│   ├── Dropdown menu (UUID list)
│   └── onUUIDSelect callback
│
└── FormFields
    ├── Name field (readonly)
    ├── Email field (readonly)
    ├── Phone field (readonly)
    ├── Address field (readonly)
    ├── Company field (readonly)
    ├── Position field (readonly)
    └── Notes field (readonly)
```

### Backend Components

```
main.py (FastAPI App)
├── CORS Middleware
├── Database Initialization
├── OpenAI Agent Initialization
└── API Routes
    ├── GET /api/uuids
    ├── POST /api/get-form-data
    └── GET /api/health

database.py
├── Database Engine (SQLite)
├── Session Management
├── init_db() - Create tables
└── seed_demo_data() - Insert demo records

models.py
└── FormData Model
    ├── uuid (primary key)
    ├── name
    ├── email
    ├── phone
    ├── address
    ├── company
    ├── position
    └── notes

agent.py (OpenAI Integration)
└── UUIDAgent
    ├── OpenAI client
    ├── map_uuid_to_form()
    └── Error handling/fallback
```

## Database Schema

```sql
CREATE TABLE form_data (
    uuid VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    company VARCHAR(100),
    position VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Request/Response Examples

### Get All UUIDs

**Request:**

```http
GET /api/uuids HTTP/1.1
Host: localhost:8000
```

**Response:**

```json
["a1b2c3d4-e5f6-7890-abcd-ef1234567890", "b2c3d4e5-f6a7-8901-bcde-f12345678901"]
```

### Get Form Data

**Request:**

```http
POST /api/get-form-data HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:**

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "address": "123 Main St, New York, NY 10001",
  "company": "Tech Corp",
  "position": "Software Engineer",
  "notes": "Senior developer with 5+ years experience"
}
```

## OpenAI Agent Processing

### Input to Agent

```python
{
    "uuid": "a1b2c3d4...",
    "raw_data": {
        "name": "john doe",
        "email": "JOHN@EXAMPLE.COM",
        "phone": "5550101",
        ...
    }
}
```

### Agent Processing

1. Validates data completeness
2. Formats names (Title Case)
3. Normalizes email (lowercase)
4. Formats phone (+1-555-0101)
5. Ensures professional presentation

### Output from Agent

```python
{
    "uuid": "a1b2c3d4...",
    "name": "John Doe",          # Formatted
    "email": "john@example.com",  # Normalized
    "phone": "+1-555-0101",       # Formatted
    ...
}
```

## Security Considerations

1. **API Key Protection**
   - Stored in `.env` file (not committed)
   - Accessed via environment variables
   - Never exposed to frontend

2. **CORS Configuration**
   - Allows only localhost origins
   - Configured for development

3. **Data Validation**
   - Pydantic models validate all inputs
   - Type checking on frontend (TypeScript)

4. **Error Handling**
   - Try-catch blocks throughout
   - Graceful degradation if AI fails
   - User-friendly error messages

## Performance Characteristics

- **Database**: SQLite (fast for local/demo usage)
- **API Response Time**: ~200-500ms (including OpenAI call)
- **Frontend Rendering**: Instant (React state updates)
- **Scalability**: Demo-level (SQLite limitation)

## Technology Choices

### Why FastAPI?

- Automatic API documentation
- Fast async performance
- Built-in data validation (Pydantic)
- Modern Python web framework

### Why React + TypeScript?

- Type-safe development
- Component reusability
- Rich ecosystem
- Modern tooling (Vite)

### Why SQLite?

- Zero configuration
- File-based (easy distribution)
- Perfect for demos/experiments
- No separate database server needed

### Why OpenAI?

- State-of-the-art language understanding
- Flexible data processing
- Easy API integration
- Intelligent formatting capabilities

## Development Workflow

1. **Backend Development**
   - Modify Python files
   - Uvicorn auto-reloads on changes
   - Test via `/docs` interface

2. **Frontend Development**
   - Modify React/TS files
   - Vite hot-reload (instant updates)
   - Test in browser

3. **Database Changes**
   - Modify `models.py`
   - Delete `uuid_forms.db`
   - Restart backend (auto-recreates)

## Deployment Considerations

For production deployment:

1. Replace SQLite with PostgreSQL/MySQL
2. Add authentication/authorization
3. Use production ASGI server (Gunicorn)
4. Build frontend (`npm run build`)
5. Serve via Nginx/Apache
6. Use HTTPS
7. Implement rate limiting
8. Add monitoring/logging

## Future Enhancements

- [ ] User authentication
- [ ] CRUD operations (Create, Update, Delete)
- [ ] Export form data (PDF, CSV)
- [ ] Batch UUID processing
- [ ] Custom field validation rules
- [ ] Multi-language support
- [ ] Advanced search/filtering
- [ ] Audit logging
- [ ] Form templates
- [ ] Real-time collaboration

---

**Version**: 1.0.0  
**Last Updated**: January 29, 2026
