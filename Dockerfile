FROM python:3.11-slim

# Install system ffmpeg and nodejs
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    nodejs \
    npm \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install frontend dependencies and build
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
ENV PORT=5000

CMD ["python", "app.py"]
