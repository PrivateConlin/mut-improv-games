# Docker & Deployment Best Practices

Production-grade containerization and deployment standards for Java Spring Boot applications.

---

## 1. Dockerfile Best Practices

### Multi-Stage Build (Optimized for Spring Boot)

```dockerfile
# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy only pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy only the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Use non-root user
USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Alternative: Gradle Build
```dockerfile
FROM gradle:8.5-jdk21-alpine AS builder

WORKDIR /app

COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle dependencies --no-daemon

COPY src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S spring && adduser -S spring -G spring
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

USER spring:spring

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

---

## 2. Docker Compose for Local Development

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mutgames-api
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DATABASE_URL=jdbc:postgresql://db:5432/mutgames
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=postgres
      - JWT_SECRET=your-dev-secret-key-change-in-production
    depends_on:
      db:
        condition: service_healthy
    networks:
      - mutgames-network
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:16-alpine
    container_name: mutgames-db
    environment:
      - POSTGRES_DB=mutgames
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    networks:
      - mutgames-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    container_name: mutgames-redis
    ports:
      - "6379:6379"
    networks:
      - mutgames-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  mutgames-network:
    driver: bridge

volumes:
  postgres-data:
```

---

## 3. .dockerignore File

```
# Build artifacts
target/
build/
*.jar
*.war

# IDE
.idea/
.vscode/
*.iml
*.ipr
*.iws

# Version control
.git/
.gitignore

# Documentation
*.md
docs/

# Test files
src/test/

# OS files
.DS_Store
Thumbs.db

# Environment files
.env
.env.local

# Logs
logs/
*.log

# Node modules (if using frontend)
node_modules/
```

---

## 4. Environment Configuration

### .env File (Local Development)
```bash
# Application
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/mutgames
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-min-256-bits-for-HS256
JWT_EXPIRATION_MS=3600000

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=DEBUG
```

### Production Environment Variables (Render.com)
```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=${DATABASE_URL}  # Provided by Render
JWT_SECRET=${JWT_SECRET}      # Set in Render dashboard
JWT_EXPIRATION_MS=3600000
LOG_LEVEL=INFO
```

---

## 5. Render.com Deployment Configuration

### render.yaml (Infrastructure as Code)
```yaml
services:
  # Main Spring Boot Application
  - type: web
    name: mutgames-api
    env: docker
    dockerfilePath: ./Dockerfile
    region: oregon
    plan: starter  # or free
    branch: main
    healthCheckPath: /actuator/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: DATABASE_URL
        fromDatabase:
          name: mutgames-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRATION_MS
        value: 3600000
      - key: JAVA_OPTS
        value: "-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
    buildCommand: mvn clean package -DskipTests
    startCommand: java $JAVA_OPTS -jar target/*.jar

databases:
  # PostgreSQL Database
  - name: mutgames-db
    databaseName: mutgames
    region: oregon
    plan: starter
    ipAllowList: []  # Allow all or specify IPs

---

## 6. Build Optimization

### Layer Caching Strategy
- **Dependencies first**: Copy pom.xml/build.gradle before source code
- **Multi-stage builds**: Separate build and runtime environments
- **Minimal runtime**: Use JRE instead of JDK for production
- **Alpine Linux**: Smaller image size (~50-100MB vs 200-300MB)

### Image Size Comparison
```
# Unoptimized
eclipse-temurin:21-jdk         ~450MB
+ Spring Boot app              ~80MB
= Total                        ~530MB

# Optimized (Multi-stage + Alpine)
Build stage (not in final image)
Runtime: eclipse-temurin:21-jre-alpine  ~180MB
+ Spring Boot app                        ~80MB
= Total                                  ~260MB
```

---

## 7. Security Best Practices

### Container Security
```dockerfile
# ✅ Use official base images
FROM eclipse-temurin:21-jre-alpine

# ✅ Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# ✅ Use specific versions (not latest)
FROM eclipse-temurin:21-jre-alpine  # Good
FROM openjdk:latest                  # Bad

# ✅ Scan for vulnerabilities
# Run: docker scout cves mutgames-api:latest
```

### Secrets Management
```yaml
# ❌ DON'T: Hardcode secrets in Dockerfile
ENV JWT_SECRET=my-secret-key

# ✅ DO: Pass secrets via environment variables
# Set in Render dashboard or docker-compose
```

### Network Security
```yaml
# docker-compose.yml
services:
  app:
    networks:
      - internal

  db:
    networks:
      - internal  # Not exposed to public

networks:
  internal:
    driver: bridge
    internal: true  # No external access
```

---

## 8. Health Checks & Monitoring

### Dockerfile Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
```

### Application Health Endpoints
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true
  health:
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true
```

### Kubernetes-Style Probes (if migrating later)
```yaml
# Liveness: Is the app running?
GET /actuator/health/liveness

# Readiness: Is the app ready to accept traffic?
GET /actuator/health/readiness
```

---

## 9. Logging in Containers

### Log to STDOUT/STDERR
```yaml
# application.yml (Production)
logging:
  level:
    root: INFO
    com.csz.mutgames: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n"
```

### Structured Logging (JSON)
```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeContext>false</includeContext>
            <fieldNames>
                <timestamp>timestamp</timestamp>
                <message>message</message>
                <logger>logger</logger>
                <level>level</level>
            </fieldNames>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### View Logs
```bash
# Docker
docker logs mutgames-api -f

# Docker Compose
docker-compose logs -f app

# Render.com
# View in dashboard or use Render CLI
```

---

## 10. Database Migrations

### Flyway Configuration
```yaml
# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### Migration Files
```sql
-- V1__initial_schema.sql
CREATE TABLE games (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_games_name ON games(name);
```

### Migration Best Practices
- **Version control**: Always commit migrations
- **Forward-only**: Never modify existing migrations
- **Test locally**: Run migrations in dev before deploying
- **Rollback plan**: Have a plan for failed migrations

---

## 11. CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn clean package -DskipTests

      - name: Run tests
        run: mvn test

      - name: Build Docker image
        run: docker build -t mutgames-api:${{ github.sha }} .

      - name: Scan for vulnerabilities
        run: docker scout cves mutgames-api:${{ github.sha }}

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push to Docker Hub
        run: |
          docker tag mutgames-api:${{ github.sha }} ${{ secrets.DOCKER_USERNAME }}/mutgames-api:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/mutgames-api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

---

## 12. Performance Tuning

### JVM Container Settings
```bash
# Dockerfile or environment variable
ENV JAVA_OPTS="\
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=100 \
  -XX:+UseStringDeduplication \
  -Djava.security.egd=file:/dev/./urandom"
```

### Resource Limits (Docker Compose)
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 13. Backup & Disaster Recovery

### Database Backups
```bash
# Automated backup script
#!/bin/bash
docker exec mutgames-db pg_dump -U postgres mutgames | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < backup-20260110.sql.gz | docker exec -i mutgames-db psql -U postgres mutgames
```

### Render.com Backups
- Enable automatic daily backups in Render dashboard
- Retention: 7 days (free tier) to 30+ days (paid)

---

## 14. Monitoring & Alerts

### Prometheus Metrics Export
```yaml
# application.yml
management:
  metrics:
    export:
      prometheus:
        enabled: true
  endpoints:
    web:
      exposure:
        include: prometheus
```

### Render.com Built-in Monitoring
- CPU usage
- Memory usage
- HTTP request metrics
- Response times
- Error rates

### External Monitoring (Optional)
- **Datadog**: APM and infrastructure monitoring
- **New Relic**: Full-stack observability
- **Sentry**: Error tracking and performance monitoring

---

## 15. Local Development Workflow

### Quick Start Commands
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v

# Run tests in container
docker-compose exec app mvn test

# Access database
docker-compose exec db psql -U postgres mutgames
```

### Hot Reload for Development
```yaml
# docker-compose.override.yml (local only)
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ~/.m2:/root/.m2
    environment:
      - SPRING_DEVTOOLS_RESTART_ENABLED=true
```

```dockerfile
# Dockerfile.dev
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

CMD ["mvn", "spring-boot:run"]
```

---

## 16. Troubleshooting

### Common Issues

#### Container won't start
```bash
# Check logs
docker logs mutgames-api

# Check health status
docker inspect mutgames-api --format='{{.State.Health.Status}}'

# Enter container for debugging
docker exec -it mutgames-api sh
```

#### Database connection issues
```bash
# Test database connectivity
docker-compose exec app wget -O- http://localhost:8080/actuator/health

# Check database is running
docker-compose exec db psql -U postgres -c "SELECT 1"
```

#### Out of memory errors
```bash
# Increase memory limit
docker run --memory=1g mutgames-api

# Check memory usage
docker stats mutgames-api
```

---

## 17. Security Scanning

### Scan Docker Images
```bash
# Using Docker Scout
docker scout cves mutgames-api:latest

# Using Trivy
trivy image mutgames-api:latest

# Using Snyk
snyk container test mutgames-api:latest
```

### Scan Dependencies
```bash
# Maven dependency check
mvn dependency-check:check

# OWASP dependency check
mvn org.owasp:dependency-check-maven:check
```

---

## Deployment Checklist

Before deploying to production:

- ✅ Multi-stage Dockerfile with Alpine base
- ✅ Non-root user configured
- ✅ Health checks implemented
- ✅ Secrets in environment variables (not hardcoded)
- ✅ Database migrations tested
- ✅ Logging to STDOUT/STDERR
- ✅ Resource limits set
- ✅ Automated backups configured
- ✅ Monitoring and alerts enabled
- ✅ Security scanning passed
- ✅ CI/CD pipeline working
- ✅ Documentation updated

---

## Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Render Documentation](https://render.com/docs)
- [12-Factor App Methodology](https://12factor.net/)
