FROM python:3.12-slim

WORKDIR /app

COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

COPY server /app/server
COPY client /app/client

WORKDIR /app/server
EXPOSE 8000

# Render / Cloud inject $PORT; default 8000 for local Docker
ENV PORT=8000
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT} --workers 1
