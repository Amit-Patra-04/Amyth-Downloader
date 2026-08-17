FROM node:20-slim

# Install Python 3 and FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp globally
RUN pip3 install --no-cache-dir --break-system-packages -U yt-dlp

WORKDIR /app

# Copy package definition and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

# Start Node backend server
CMD ["node", "server.js"]
