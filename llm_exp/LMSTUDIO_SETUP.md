# LM Studio Setup Guide

This guide explains how to use LM Studio with locally hosted Gemma 3 instead of OpenAI API.

## Prerequisites

1. **Download and Install LM Studio**
   - Visit [https://lmstudio.ai/](https://lmstudio.ai/)
   - Download and install LM Studio for your platform

2. **Download Gemma 3 Model**
   - Open LM Studio
   - Go to the "Discover" tab
   - Search for "gemma-3" or "gemma"
   - Download your preferred Gemma 3 variant (e.g., gemma-2-9b-it-GGUF)

## Configuration

### Step 1: Start LM Studio Server

1. Open LM Studio
2. Go to the "Local Server" tab
3. Select your downloaded Gemma 3 model
4. Click "Start Server"
5. Verify server is running at `http://localhost:1234`

### Step 2: Configure Environment Variables

Add or modify these environment variables in your `.env` file:

```bash
# Switch to LM Studio provider
LLM_PROVIDER=lmstudio

# Optional: Specify model name (default: gemma-3)
LMSTUDIO_MODEL=gemma-3

# OpenAI key no longer needed when using LM Studio
# OPENAI_API_KEY=sk-...
```

### Step 3: Start the Backend

```bash
cd backend
python main.py
```

You should see: `Using LM Studio with locally hosted model`

## Switching Between Providers

### Use LM Studio (Local)

```bash
LLM_PROVIDER=lmstudio
```

### Use OpenAI (Cloud)

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

## Verification

Check the health endpoint to verify configuration:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "llm_provider": "lmstudio",
  "openai_configured": false,
  "lmstudio_enabled": true
}
```

## Troubleshooting

### "Connection refused" error

- Ensure LM Studio server is running
- Verify server is at `http://localhost:1234`
- Check LM Studio server logs

### Slow responses

- Gemma 3 runs locally on your hardware
- Performance depends on your CPU/GPU
- Consider using a smaller model variant if responses are slow
- Ensure LM Studio is using GPU acceleration if available

### Model not loading

- Verify model is fully downloaded in LM Studio
- Try restarting LM Studio server
- Check LM Studio's memory requirements

## Benefits of LM Studio

✅ **Privacy**: All data stays on your machine
✅ **No API costs**: No per-request charges
✅ **Offline capable**: Works without internet
✅ **Control**: Full control over model and parameters

## Performance Notes

- Local models may be slower than cloud APIs
- Response quality depends on model size and your hardware
- For production use, consider hardware requirements
- Gemma 3 provides good balance of quality and performance
