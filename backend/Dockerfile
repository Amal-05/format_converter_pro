FROM node:18-bullseye

# Install LibreOffice, FFmpeg, Java (required for some conversions), and standard fonts
RUN apt-get update && apt-get install -y \
    libreoffice \
    ffmpeg \
    default-jre \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Ensure temp directory exists and has correct permissions
RUN mkdir -p temp && chmod 777 temp

EXPOSE 3000

CMD ["npm", "start"]
