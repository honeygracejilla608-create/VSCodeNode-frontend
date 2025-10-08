# Use Node.js 18 LTS with security updates
FROM node:18-alpine3.18

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app directory with correct permissions
WORKDIR /app

# Create non-root user first
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build the client
RUN npm run build

# Switch back to root for health check setup
USER root

# Copy health check script and make it executable
COPY --chown=nextjs:nodejs healthcheck.js .
RUN chmod +x healthcheck.js

# Switch back to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
