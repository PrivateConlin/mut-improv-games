# Java Spring Boot - Industry Best Practices

This document outlines production-grade best practices inspired by engineering standards from Google, Facebook, Netflix, Uber, and other leading tech companies.

---

## 1. Code Organization & Architecture

### Package Structure (Domain-Driven Design)
```
com.csz.mutgames/
├── config/              # Configuration classes
├── controller/          # REST controllers
├── service/             # Business logic
├── repository/          # Data access layer
├── model/
│   ├── entity/         # JPA entities
│   ├── dto/            # Data Transfer Objects
│   └── mapper/         # Entity-DTO mappers
├── exception/          # Custom exceptions & handlers
├── security/           # Security configurations
├── validation/         # Custom validators
└── util/               # Utility classes
```

### Key Principles
- **Single Responsibility**: Each class should have one reason to change
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Interface Segregation**: Use interfaces to define contracts
- **Open/Closed**: Open for extension, closed for modification

---

## 2. Dependency Injection

### ✅ DO: Constructor Injection (Immutable Dependencies)
```java
@Service
public class GameService {
    private final GameRepository gameRepository;
    private final GameMapper gameMapper;

    public GameService(GameRepository gameRepository, GameMapper gameMapper) {
        this.gameRepository = gameRepository;
        this.gameMapper = gameMapper;
    }
}
```

### ❌ DON'T: Field Injection
```java
@Service
public class GameService {
    @Autowired  // Avoid this!
    private GameRepository gameRepository;
}
```

**Why**: Constructor injection ensures immutability, testability, and makes dependencies explicit.

---

## 3. Exception Handling

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage(), "NOT_FOUND"));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(ex.getMessage(), "VALIDATION_ERROR"));
    }
}
```

### Custom Exceptions
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String id) {
        super(String.format("%s not found with id: %s", resource, id));
    }
}
```

**Never** swallow exceptions without logging or rethrowing.

---

## 4. Logging (SLF4J + Logback)

### Logging Levels (Google Style)
- **ERROR**: System failures requiring immediate attention
- **WARN**: Recoverable issues that should be monitored
- **INFO**: Significant business events (user actions, state changes)
- **DEBUG**: Detailed diagnostic information
- **TRACE**: Very detailed diagnostic information

### ✅ DO: Structured Logging with Context
```java
@Service
@Slf4j
public class PollService {

    public Poll createPoll(CreatePollRequest request, String adminId) {
        log.info("Creating poll. adminId={}, pollName={}", adminId, request.getName());

        try {
            Poll poll = pollRepository.save(buildPoll(request, adminId));
            log.info("Poll created successfully. pollId={}, adminId={}", poll.getId(), adminId);
            return poll;
        } catch (Exception ex) {
            log.error("Failed to create poll. adminId={}, error={}", adminId, ex.getMessage(), ex);
            throw new PollCreationException("Failed to create poll", ex);
        }
    }
}
```

### ❌ DON'T: String Concatenation in Logs
```java
log.info("Creating poll for admin: " + adminId);  // Avoid this!
```

### Performance-Sensitive Logging
```java
if (log.isDebugEnabled()) {
    log.debug("Complex calculation result: {}", expensiveOperation());
}
```

---

## 5. REST API Design

### RESTful Endpoint Conventions
```java
@RestController
@RequestMapping("/api/v1/games")
@Validated
public class GameController {

    // GET /api/v1/games
    @GetMapping
    public ResponseEntity<Page<GameDTO>> getAllGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // ...
    }

    // GET /api/v1/games/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable String id) {
        // ...
    }

    // POST /api/v1/games
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody CreateGameRequest request) {
        // ...
    }

    // PUT /api/v1/games/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> updateGame(
            @PathVariable String id,
            @Valid @RequestBody UpdateGameRequest request) {
        // ...
    }

    // DELETE /api/v1/games/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable String id) {
        // ...
    }
}
```

### Response Patterns
```java
// Success with data
return ResponseEntity.ok(gameDTO);

// Created
return ResponseEntity.status(HttpStatus.CREATED).body(createdGame);

// No content
return ResponseEntity.noContent().build();

// Not found
return ResponseEntity.notFound().build();

// Bad request
return ResponseEntity.badRequest().body(errorResponse);
```

---

## 6. Validation

### Bean Validation (JSR 380)
```java
public class CreateGameRequest {

    @NotBlank(message = "Game name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @NotNull(message = "Player count is required")
    @Valid
    private PlayerCount playerCount;

    @NotNull(message = "Difficulty is required")
    @Pattern(regexp = "beginner|intermediate|advanced", message = "Invalid difficulty level")
    private String difficulty;

    @NotEmpty(message = "Tags cannot be empty")
    private List<String> tags;
}

public class PlayerCount {

    @Min(value = 1, message = "Minimum players must be at least 1")
    private Integer min;

    @Min(value = 1, message = "Maximum players must be at least 1")
    private Integer max;

    @Min(value = 1, message = "Optimal players must be at least 1")
    private Integer optimal;

    @AssertTrue(message = "Player count logic is invalid")
    public boolean isValid() {
        return min <= optimal && optimal <= max;
    }
}
```

### Custom Validators
```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailListValidator.class)
public @interface ValidEmailList {
    String message() default "Invalid email list";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class EmailListValidator implements ConstraintValidator<ValidEmailList, List<String>> {

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Override
    public boolean isValid(List<String> emails, ConstraintValidatorContext context) {
        if (emails == null || emails.isEmpty()) {
            return false;
        }
        return emails.stream().allMatch(email -> EMAIL_PATTERN.matcher(email).matches());
    }
}
```

---

## 7. Security Best Practices

### Password Hashing
```java
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // Cost factor 12
    }
}
```

### JWT Configuration
```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .setSubject(userPrincipal.getId())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
}
```

### Input Sanitization
- **Always validate and sanitize user input**
- **Use parameterized queries** (JPA does this by default)
- **Never trust client-side validation alone**
- **Implement rate limiting** on authentication endpoints

---

## 8. Testing Standards

### Unit Tests (JUnit 5 + Mockito)
```java
@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private GameMapper gameMapper;

    @InjectMocks
    private GameService gameService;

    @Test
    @DisplayName("Should create game successfully")
    void shouldCreateGameSuccessfully() {
        // Given
        CreateGameRequest request = new CreateGameRequest("Test Game");
        Game game = new Game();
        game.setId("test-id");

        when(gameMapper.toEntity(request)).thenReturn(game);
        when(gameRepository.save(any(Game.class))).thenReturn(game);

        // When
        GameDTO result = gameService.createGame(request);

        // Then
        assertNotNull(result);
        assertEquals("test-id", result.getId());
        verify(gameRepository, times(1)).save(any(Game.class));
    }

    @Test
    @DisplayName("Should throw exception when game not found")
    void shouldThrowExceptionWhenGameNotFound() {
        // Given
        when(gameRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
            () -> gameService.getGameById("invalid-id"));
    }
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should return all games")
    void shouldReturnAllGames() throws Exception {
        mockMvc.perform(get("/api/v1/games")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
```

### Test Coverage Goals
- **Minimum 80% code coverage** for services
- **100% coverage** for critical business logic
- **Integration tests** for all REST endpoints

---

## 9. Performance & Optimization

### Database Query Optimization
```java
// ✅ DO: Use pagination
@Query("SELECT g FROM Game g WHERE g.difficulty = :difficulty")
Page<Game> findByDifficulty(@Param("difficulty") String difficulty, Pageable pageable);

// ✅ DO: Fetch only required fields with projections
interface GameSummary {
    String getId();
    String getName();
    String getDifficulty();
}

@Query("SELECT g FROM Game g")
List<GameSummary> findAllSummaries();

// ❌ DON'T: N+1 query problem
// Use @EntityGraph or JOIN FETCH to avoid
@EntityGraph(attributePaths = {"tags", "playerCount"})
Optional<Game> findById(String id);
```

### Caching Strategy
```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("games", "polls");
    }
}

@Service
public class GameService {

    @Cacheable(value = "games", key = "#id")
    public GameDTO getGameById(String id) {
        // Cached after first call
    }

    @CacheEvict(value = "games", key = "#id")
    public void updateGame(String id, UpdateGameRequest request) {
        // Invalidates cache
    }
}
```

### Async Processing
```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class EmailService {

    @Async
    public CompletableFuture<Void> sendVoteConfirmation(String email, Poll poll) {
        // Async email sending
        log.info("Sending vote confirmation to {}", email);
        // ... email logic
        return CompletableFuture.completedFuture(null);
    }
}
```

---

## 10. Configuration Management

### Application Properties Pattern
```yaml
# application.yml
spring:
  application:
    name: mut-games-api
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

# application-dev.yml
spring:
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: create-drop

# application-prod.yml
spring:
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

logging:
  level:
    root: INFO
    com.csz.mutgames: DEBUG
```

### Environment Variables for Secrets
```yaml
jwt:
  secret: ${JWT_SECRET}
  expiration-ms: 3600000

spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
```

**Never commit secrets to version control!**

---

## 11. Code Quality Standards

### Method Naming (Google Java Style)
```java
// ✅ Good: Verb-noun pattern
public List<Game> findGamesByDifficulty(String difficulty)
public void deleteGame(String id)
public boolean isValidEmail(String email)
public GameDTO createGame(CreateGameRequest request)

// ❌ Bad: Unclear names
public List<Game> get(String d)
public void remove(String id)
public boolean check(String email)
```

### Constants
```java
public final class GameConstants {
    private GameConstants() {} // Prevent instantiation

    public static final int MAX_VOTES_PER_USER = 10;
    public static final String DEFAULT_DIFFICULTY = "beginner";
    public static final List<String> VALID_DIFFICULTIES =
        List.of("beginner", "intermediate", "advanced");
}
```

### Utility Classes
```java
public final class ValidationUtils {
    private ValidationUtils() {} // Prevent instantiation

    public static boolean isValidEmail(String email) {
        // Validation logic
    }
}
```

---

## 12. Transaction Management

### Declarative Transactions
```java
@Service
@Transactional(readOnly = true)  // Default for all methods
public class PollService {

    @Transactional  // Override for write operations
    public Poll createPoll(CreatePollRequest request, String adminId) {
        Poll poll = pollRepository.save(buildPoll(request, adminId));

        // Both operations in same transaction
        voteService.initializePollVotes(poll.getId());

        return poll;
    }

    public Poll getPollById(String id) {
        // Read-only transaction
        return pollRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Poll", id));
    }
}
```

### Transaction Best Practices
- **Keep transactions short** - minimize time holding locks
- **Read-only transactions** for query methods
- **Avoid external calls** inside transactions (e.g., HTTP calls, email sending)
- **Handle transaction boundaries** carefully

---

## 13. Documentation Standards

### Javadoc for Public APIs
```java
/**
 * Service for managing improv game operations.
 *
 * <p>Provides functionality for creating, updating, retrieving, and deleting games.
 * All write operations require ADMIN role authorization.
 *
 * @author CSZ Team
 * @since 1.0
 */
@Service
public class GameService {

    /**
     * Retrieves a game by its unique identifier.
     *
     * @param id the unique identifier of the game
     * @return the game details
     * @throws ResourceNotFoundException if game with given id does not exist
     */
    public GameDTO getGameById(String id) {
        // ...
    }
}
```

### API Documentation (OpenAPI/Swagger)
```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("MUT Games API")
                .version("1.0")
                .description("API for managing improv games and voting polls"));
    }
}

@RestController
@Tag(name = "Games", description = "Game management APIs")
public class GameController {

    @Operation(summary = "Get game by ID", description = "Returns a single game")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved"),
        @ApiResponse(responseCode = "404", description = "Game not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable String id) {
        // ...
    }
}
```

---

## 14. Monitoring & Observability

### Actuator Endpoints
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

### Custom Metrics
```java
@Service
public class PollService {

    private final MeterRegistry meterRegistry;

    public Poll createPoll(CreatePollRequest request, String adminId) {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            Poll poll = pollRepository.save(buildPoll(request, adminId));
            meterRegistry.counter("polls.created").increment();
            return poll;
        } finally {
            sample.stop(meterRegistry.timer("polls.creation.time"));
        }
    }
}
```

### Health Checks
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final GameRepository gameRepository;

    @Override
    public Health health() {
        try {
            long count = gameRepository.count();
            return Health.up()
                .withDetail("games.count", count)
                .build();
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }
}
```

---

## 15. Error Response Standardization

### Consistent Error Response
```java
@Data
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private String errorCode;
    private LocalDateTime timestamp;
    private String path;

    public ErrorResponse(String message, String errorCode) {
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }
}
```

---

## Summary Checklist

Before committing code, ensure:

- ✅ Constructor injection used for dependencies
- ✅ Proper exception handling with global handler
- ✅ Structured logging with context
- ✅ Input validation on all DTOs
- ✅ RESTful API conventions followed
- ✅ Unit tests written with >80% coverage
- ✅ Transactions properly scoped
- ✅ Secrets in environment variables
- ✅ API documentation complete
- ✅ No hardcoded values
- ✅ Code follows naming conventions
- ✅ Performance optimizations applied (caching, pagination)

---

**References:**
- Google Java Style Guide
- Spring Boot Best Practices
- Netflix Engineering Blog
- Uber Engineering Blog
- Clean Code by Robert C. Martin