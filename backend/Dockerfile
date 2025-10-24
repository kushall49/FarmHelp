# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Build TypeScript
RUN npm run build

# Create necessary directories
RUN mkdir -p uploads/plants data/confirmed logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:8000/', (res) => process.exit(res.statusCode === 200 ? 0 : 1));"

# Run application
CMD ["node", "dist/index.js"]
