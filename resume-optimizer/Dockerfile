# Stage 1: Build frontend
FROM node:18 AS frontend
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Stage 2: Backend with built frontend
FROM python:3.10-slim
WORKDIR /app

# Install Python dependencies
COPY backend ./backend
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Install wkhtmltopdf
RUN apt-get update && apt-get install -y wkhtmltopdf && apt-get clean

# Copy frontend build to backend static
COPY --from=frontend /app/frontend/dist ../frontend_dist

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Start backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]