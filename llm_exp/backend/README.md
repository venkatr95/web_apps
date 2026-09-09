# Backend Setup Guide

## Quick Start

1. **Create virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment:**

   ```bash
   # Windows
   .\venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**

   ```bash
   copy .env.example .env
   ```

   Then edit `.env` and add your OpenAI API key or configure LM Studio.

   **Option A - OpenAI (Cloud):**

   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```

   **Option B - LM Studio (Local):**

   ```
   LLM_PROVIDER=lmstudio
   LMSTUDIO_MODEL=gemma-3
   ```

   📖 See [LMSTUDIO_SETUP.md](LMSTUDIO_SETUP.md) for detailed LM Studio setup instructions.

5. **Run the server:**
   ```bash
   python main.py
   ```

Server will start at: http://localhost:8000
API docs: http://localhost:8000/docs

## Database

- SQLite database file: `uuid_forms.db`
- Auto-created on first run with demo data
- To reset: Delete `uuid_forms.db` and restart server

## API Endpoints

- `GET /api/uuids` - List all UUIDs
- `POST /api/get-form-data` - Get form data for UUID
- `GET /api/health` - Health check

## Development

Run with auto-reload (default):

```bash
python main.py
```

## Environment Variables

Configuration in `.env`:

### LLM Provider Selection

- `LLM_PROVIDER` - Choose "openai" or "lmstudio" (default: openai)

### OpenAI Configuration (when LLM_PROVIDER=openai)

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - Model to use (default: gpt-4o-mini)

### LM Studio Configuration (when LLM_PROVIDER=lmstudio)

- `LMSTUDIO_MODEL` - Model name (default: gemma-3)
- LM Studio server must be running at `http://localhost:1234`

For detailed LM Studio setup, see [LMSTUDIO_SETUP.md](LMSTUDIO_SETUP.md)
