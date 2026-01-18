# Claude Rules & Best Practices

This directory contains the rules, standards, and best practices that must be followed during all development work in this repository.

## 📚 Files in This Directory

### 1. CLAUDE.md
**Purpose**: Primary guidance document for Claude Code
**Contains**:
- **CRITICAL RULES** - Must-follow principles for every prompt
- Project overview and technology stack
- High-level architecture and domain model
- API endpoint reference
- Game schema validation rules
- Common development workflows
- Security, performance guidelines

**When to reference**: **ON EVERY PROMPT** - Read this FIRST

---

### 2. JAVA_BEST_PRACTICES.md
**Purpose**: Industry-standard Java and Spring Boot coding practices
**Contains**:
- Code organization (package structure, DDD principles)
- Dependency injection patterns (constructor injection)
- Exception handling (global handlers, custom exceptions)
- Logging standards (SLF4J structured logging)
- REST API design conventions
- Bean validation (JSR 380)
- Security best practices (JWT, BCrypt, input sanitization)
- Testing standards (JUnit 5, Mockito, 80% coverage)
- Performance optimization (caching, pagination, async processing)
- Transaction management
- Documentation standards (Javadoc, OpenAPI)
- Monitoring & observability (Actuator, Prometheus)

**When to reference**: When writing ANY Java code, especially:
- Creating new services, controllers, or repositories
- Implementing security features
- Writing tests
- Adding logging or metrics

---

### 3. DOCKER_DEPLOYMENT_PRACTICES.md
**Purpose**: Production-grade containerization and deployment standards
**Contains**:
- Multi-stage Dockerfile best practices
- Docker Compose for local development
- .dockerignore configuration
- Environment variable management
- Render.com deployment configuration
- Security practices (non-root users, image scanning)
- Health checks and monitoring
- Logging in containers (STDOUT/STDERR)
- Database migrations with Flyway
- CI/CD pipeline setup (GitHub Actions)
- Performance tuning (JVM container settings)
- Backup and disaster recovery
- Troubleshooting common issues

**When to reference**: When:
- Creating or modifying Dockerfiles
- Setting up deployment configurations
- Working with environment variables
- Implementing health checks
- Troubleshooting deployment issues

---

### 4. TESTING_BEST_PRACTICES.md
**Purpose**: Comprehensive testing standards and patterns
**Contains**:
- JUnit 5 best practices (test structure, assertions)
- Mockito usage (matcher rules, when to mock)
- Test coverage requirements (80%+ for services, 100% for critical logic)
- Parameterized testing (@ParameterizedTest, @MethodSource)
- Async testing with Awaitility (NEVER use Thread.sleep())
- Test helper patterns (builders, assertions, base classes)
- Branch coverage requirements (test ALL conditional paths)
- Common testing mistakes to avoid

**When to reference**: **EVERY TIME** you write tests:
- Creating new test classes
- Testing new features
- Ensuring complete branch coverage
- Writing async/timing-dependent tests

---

## 🎯 Core Principles (Must Follow)

### Code Quality
- ✅ **Constructor Injection**: Always use constructor injection, never field injection
- ✅ **Exception Handling**: Use `@RestControllerAdvice` for global exception handling
- ✅ **Logging**: Structured logging with context (userId, pollId, etc.), no string concatenation
- ✅ **Validation**: Use JSR 380 annotations on all DTOs
- ✅ **Testing**: Minimum 80% coverage for services, 100% for critical business logic

### Security
- ✅ **Secrets**: Never hardcode secrets, always use environment variables
- ✅ **Passwords**: BCrypt with cost factor 12
- ✅ **JWT**: Proper expiration, HTTPS only
- ✅ **Input Validation**: Validate and sanitize all user input
- ✅ **CORS**: Whitelist frontend domain only

### Docker & Deployment
- ✅ **Multi-stage builds**: Separate build and runtime stages
- ✅ **Non-root user**: Always run containers as non-root
- ✅ **Alpine images**: Use Alpine for smaller image sizes
- ✅ **Health checks**: Implement proper health check endpoints
- ✅ **Security scanning**: Scan images with `docker scout cves`

### Performance
- ✅ **Pagination**: Use `Page<T>` for all list endpoints
- ✅ **Caching**: Cache frequently accessed data with `@Cacheable`
- ✅ **Async**: Use `@Async` for non-critical operations
- ✅ **Indexing**: Add database indexes on frequently queried columns

---

## 🚀 Quick Reference

### Starting a New Feature
1. Read CLAUDE.md for architecture overview
2. Follow JAVA_BEST_PRACTICES.md for implementation
3. Reference DOCKER_DEPLOYMENT_PRACTICES.md if touching deployment

### Writing Code
- Check package structure in JAVA_BEST_PRACTICES.md
- Follow naming conventions and patterns
- Implement proper logging with context
- Write tests alongside code (TDD)

### Creating APIs
- Follow RESTful conventions in JAVA_BEST_PRACTICES.md
- Use proper HTTP verbs and status codes
- Validate input with JSR 380
- Document with OpenAPI annotations

### Deploying
- Follow multi-stage Dockerfile pattern
- Configure environment variables properly
- Implement health checks
- Test locally with Docker Compose first

---

## 📖 How Claude Should Use These Files

**On EVERY prompt**, Claude should:
1. Reference CLAUDE.md for project context and architecture
2. Apply JAVA_BEST_PRACTICES.md when writing any Java code
3. Apply DOCKER_DEPLOYMENT_PRACTICES.md when working with Docker or deployment

**These are not suggestions - they are REQUIREMENTS.**

All code written must adhere to these standards. If a practice conflicts with user requirements, ask for clarification before proceeding.

---

## 🔄 Updating These Files

These files should be updated when:
- New patterns are established in the codebase
- Architectural decisions are made
- Best practices evolve
- Team learns from production issues

Always keep these files in sync with actual code practices.
