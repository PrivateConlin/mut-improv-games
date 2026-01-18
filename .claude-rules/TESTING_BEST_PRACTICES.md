# Testing Best Practices

Industry-standard testing practices for Java Spring Boot applications.

---

## Table of Contents

1. [Core Testing Principles](#core-testing-principles)
2. [JUnit 5 Best Practices](#junit-5-best-practices)
3. [Mockito Best Practices](#mockito-best-practices)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Parameterized Tests](#parameterized-tests)
6. [Asynchronous Testing](#asynchronous-testing)
7. [Test Helper Patterns](#test-helper-patterns)
8. [Common Testing Mistakes](#common-testing-mistakes)

---

## Core Testing Principles

### CRITICAL: 100% Test Coverage for New Code

**Rule**: ALWAYS write tests for ALL code paths when implementing new functionality.

**Process (NON-NEGOTIABLE)**:
1. Implement new code
2. **IMMEDIATELY** identify all code paths (success, validation errors, business logic errors)
3. **IMMEDIATELY** write test for each code path
4. **IMMEDIATELY** check for method overloads and test each one
5. Run `mvn clean test` to verify tests pass
6. Run coverage report to verify target coverage maintained
7. If coverage < target, identify missing tests and add them **BEFORE** moving on

**Target Coverage**:
- Services: 80% minimum
- Critical business logic: 100%
- Utility classes: 90%+
- Controllers: 70%+ (integration tests cover the rest)

---

## JUnit 5 Best Practices

### Test Class Structure

```java
@SpringBootTest  // For integration tests
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class GameServiceTest {

    @Autowired
    private GameService gameService;

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameService serviceUnderTest;  // For unit tests

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Test setup
    }

    @AfterEach
    void tearDown() {
        // Cleanup
    }

    @Test
    @DisplayName("Should create game with valid data")
    void testCreateGame_WithValidData_Success() {
        // Given
        GameDTO gameDTO = GameDTO.builder()
            .name("Test Game")
            .difficulty("beginner")
            .build();

        // When
        Game result = gameService.createGame(gameDTO);

        // Then
        assertNotNull(result);
        assertEquals("Test Game", result.getName());
    }
}
```

### Assertion Best Practices

**Use AssertJ for fluent assertions**:
```java
// ✅ GOOD - Fluent and readable
assertThat(game.getName()).isEqualTo("Categories");
assertThat(game.getTags()).containsExactly("family_friendly", "jam_friendly");
assertThat(game.getPlayerCount().getMin()).isLessThanOrEqualTo(game.getPlayerCount().getOptimal());

// ❌ AVOID - Less readable
assertEquals("Categories", game.getName());
assertTrue(game.getTags().contains("family_friendly"));
```

---

## Mockito Best Practices

### The Golden Rule for Matchers

**You must follow ONE of these patterns**:
1. **NO matchers at all** - Pass all values directly
2. **ALL matchers** - If you use ANY matcher, then ALL arguments must be matchers

#### ❌ WRONG - Mixing Matchers with Raw Values
```java
verify(service).save(any(Game.class), "user123");  // WRONG!
```

#### ✅ CORRECT - All Matchers or No Matchers
```java
// Option 1: All matchers
verify(service).save(any(Game.class), eq("user123"));

// Option 2: No matchers (preferred when values are known)
verify(service).save(game, "user123");
```

### When to Use Matchers

**Use matchers when**:
- Testing with any value of a type: `any(Game.class)`, `anyString()`, `anyLong()`
- Testing with specific conditions: `argThat(g -> g.getName().startsWith("Test"))`
- You don't care about exact value

**Don't use matchers when**:
- You know the exact values
- It makes tests less clear

---

## Test Coverage Requirements

### Branch Coverage is Mandatory

**CRITICAL**: When adding conditional logic, ALWAYS add tests for ALL branches.

#### ❌ WRONG - Incomplete Coverage
```java
// Production code
if (game.getTags() != null && !game.getTags().isEmpty()) {
    validateTags(game.getTags());
}
if (game.getPlayerCount() != null) {
    validatePlayerCount(game.getPlayerCount());
}

// Tests - INCOMPLETE!
@Test
void testValidation_WithAllFields() {
    // Tests both conditions true
}

@Test
void testValidation_WithNoFields() {
    // Tests both conditions false
}
// Missing: tags present but playerCount null
// Missing: playerCount present but tags null
```

#### ✅ CORRECT - Complete Coverage
```java
@Test
void testValidation_WithBothFields() { /* both conditions true */ }

@Test
void testValidation_WithNoFields() { /* both conditions false */ }

@Test
void testValidation_WithTagsOnly() { /* first true, second false */ }

@Test
void testValidation_WithPlayerCountOnly() { /* first false, second true */ }
```

**Coverage Checklist**:
- [ ] Test when first condition is true, second is false
- [ ] Test when first condition is false, second is true
- [ ] Test when both conditions are true
- [ ] Test when both conditions are false

---

## Parameterized Tests

### Reduce Test Duplication with @ParameterizedTest

**Use parameterized tests when you have 3+ tests with identical logic but different inputs.**

#### ❌ WRONG - Duplicate Test Methods
```java
@Test
void testValidation_NullValue() {
    assertThrows(ValidationException.class, () -> validator.validate(null));
}

@Test
void testValidation_EmptyValue() {
    assertThrows(ValidationException.class, () -> validator.validate(""));
}

@Test
void testValidation_WhitespaceValue() {
    assertThrows(ValidationException.class, () -> validator.validate("   "));
}
```

#### ✅ CORRECT - Single Parameterized Test
```java
@ParameterizedTest
@ValueSource(strings = {"", "   "})
@NullSource
@DisplayName("Should throw ValidationException for invalid values")
void testValidation_InvalidValue_ThrowsException(String value) {
    assertThrows(ValidationException.class, () -> validator.validate(value));
}
```

### Using @MethodSource for Complex Parameters

```java
@ParameterizedTest
@MethodSource("provideGameDifficulties")
@DisplayName("Should validate all difficulty levels")
void testDifficultyValidation(String difficulty, boolean expectedValid) {
    if (expectedValid) {
        assertDoesNotThrow(() -> validator.validateDifficulty(difficulty));
    } else {
        assertThrows(ValidationException.class, () -> validator.validateDifficulty(difficulty));
    }
}

static Stream<Arguments> provideGameDifficulties() {
    return Stream.of(
        Arguments.of("beginner", true),
        Arguments.of("intermediate", true),
        Arguments.of("advanced", true),
        Arguments.of("expert", false),
        Arguments.of("", false),
        Arguments.of(null, false)
    );
}
```

---

## Asynchronous Testing

### CRITICAL: Never Use Thread.sleep()

**Rule**: NEVER use `Thread.sleep()` in tests. ALWAYS use Awaitility.

#### ❌ WRONG - Using Thread.sleep()
```java
@Test
void testCacheExpiration() throws InterruptedException {
    cache.put("key", "value");
    Thread.sleep(1000);  // Brittle, slow, unreliable
    assertNull(cache.get("key"));
}
```

**Problems**:
- Brittle: May fail on slow CI/CD systems
- Slow: Always waits full duration
- Unreliable: No guarantee condition is met
- Poor error messages

#### ✅ CORRECT - Using Awaitility
```java
@Test
void testCacheExpiration() {
    cache.put("key", "value");

    await()
        .atMost(2, SECONDS)
        .pollInterval(10, MILLISECONDS)
        .until(() -> cache.get("key") == null);
}
```

**Benefits**:
- Reliable: Polls until condition met or timeout
- Fast: Returns immediately when condition satisfied
- Clear error messages
- Industry standard

### Awaitility Dependency

```xml
<dependency>
    <groupId>org.awaitility</groupId>
    <artifactId>awaitility</artifactId>
    <version>4.2.0</version>
    <scope>test</scope>
</dependency>
```

### Common Awaitility Patterns

```java
// Wait for async operation
await()
    .atMost(5, SECONDS)
    .until(() -> asyncService.isComplete());

// Wait for value change
await()
    .atMost(3, SECONDS)
    .until(() -> service.getStatus() == Status.READY);

// With fail-fast condition
await()
    .atMost(2, SECONDS)
    .failFast(() -> service.hasFailed())
    .until(() -> service.isReady());
```

---

## Test Helper Patterns

### Assertion Helpers

**Create reusable assertion helpers to reduce duplication.**

```java
public class GameAssertions {

    public static void assertValidGame(Game game) {
        assertNotNull(game);
        assertNotNull(game.getId());
        assertNotNull(game.getName());
        assertTrue(game.getPlayerCount().getMin() <= game.getPlayerCount().getOptimal());
        assertTrue(game.getPlayerCount().getOptimal() <= game.getPlayerCount().getMax());
    }

    public static void assertGameEquals(Game expected, Game actual) {
        assertThat(actual.getId()).isEqualTo(expected.getId());
        assertThat(actual.getName()).isEqualTo(expected.getName());
        assertThat(actual.getDifficulty()).isEqualTo(expected.getDifficulty());
        assertThat(actual.getTags()).containsExactlyInAnyOrderElementsOf(expected.getTags());
    }
}
```

### Test Data Builders

**Use builder pattern for consistent test data creation.**

```java
public class TestDataBuilder {

    public static Game.GameBuilder defaultGame() {
        return Game.builder()
            .id("test_game")
            .name("Test Game")
            .difficulty("beginner")
            .duration("5-10 minutes")
            .audienceParticipation(false)
            .playerCount(PlayerCount.builder()
                .min(4)
                .optimal(6)
                .max(10)
                .build())
            .tags(Arrays.asList("family_friendly"));
    }

    public static Game createBeginnerGame() {
        return defaultGame()
            .difficulty("beginner")
            .build();
    }

    public static Game createAdvancedGame() {
        return defaultGame()
            .difficulty("advanced")
            .build();
    }
}
```

### Base Test Classes

**Extract common setup into base classes.**

```java
public abstract class BaseServiceTest {

    @Mock
    protected GameRepository gameRepository;

    @Mock
    protected PollRepository pollRepository;

    @Mock
    protected EmailService emailService;

    @BeforeEach
    void baseSetUp() {
        MockitoAnnotations.openMocks(this);
    }

    protected Game saveGame(Game game) {
        when(gameRepository.save(any(Game.class))).thenReturn(game);
        return game;
    }
}

// Usage
class GameServiceTest extends BaseServiceTest {
    @InjectMocks
    private GameService gameService;

    @Test
    void testCreateGame() {
        Game game = TestDataBuilder.defaultGame().build();
        saveGame(game);  // Helper from base class
        // ... test logic
    }
}
```

---

## Common Testing Mistakes

### 1. Missing Test Coverage for New Code

**Mistake**: Adding new methods without writing tests
**Impact**: Coverage drops, bugs go undetected
**Fix**: Write tests IMMEDIATELY after implementing new code

### 2. Incomplete Branch Coverage

**Mistake**: Testing only happy paths, ignoring error paths
**Impact**: Bugs hide in untested code paths
**Fix**: Test ALL branches (if/else, try/catch, loops)

### 3. Over-Complicating Tests

**Mistake**: Making tests too complex with excessive mocking
**Impact**: Tests become hard to maintain, brittle
**Fix**: Keep tests simple, mock only external dependencies

### 4. Not Testing Edge Cases

**Mistake**: Only testing typical inputs
**Impact**: Edge cases cause production bugs
**Fix**: Test null, empty, boundary values, max/min

### 5. Using Thread.sleep() for Timing

**Mistake**: Using `Thread.sleep()` for async tests
**Impact**: Slow, brittle, unreliable tests
**Fix**: Use Awaitility for all timing-dependent tests

### 6. Mixing Mockito Matchers with Raw Values

**Mistake**: `verify(service).method(any(), "value")`
**Impact**: Tests fail with `InvalidUseOfMatchersException`
**Fix**: Use all matchers or no matchers

### 7. Not Using Parameterized Tests

**Mistake**: Duplicating test methods for different inputs
**Impact**: Code duplication, harder to maintain
**Fix**: Use `@ParameterizedTest` for 3+ similar tests

### 8. Testing Implementation Details

**Mistake**: Testing private methods, internal state
**Impact**: Tests break when refactoring
**Fix**: Test public API, verify behavior not implementation

---

## Testing Checklist

Before marking code complete:

- [ ] All new public methods have tests
- [ ] All method overloads have tests
- [ ] All error paths have tests (exceptions, validation failures)
- [ ] All conditional branches have tests (if/else)
- [ ] Edge cases tested (null, empty, boundary values)
- [ ] Async operations use Awaitility (not Thread.sleep)
- [ ] No Mockito matcher mixing
- [ ] Parameterized tests used for similar test cases (3+)
- [ ] Test coverage meets targets (80%+ for services)
- [ ] Tests pass locally: `mvn clean test`
- [ ] No skipped or ignored tests without justification

---

## Example: Complete Test Suite

```java
@SpringBootTest
@DisplayName("GameService Tests")
class GameServiceTest {

    @Autowired
    private GameService gameService;

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameService serviceUnderTest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Nested
    @DisplayName("Create Game Tests")
    class CreateGameTests {

        @Test
        @DisplayName("Should create game with valid data")
        void testCreateGame_ValidData_Success() {
            // Given
            GameDTO dto = TestDataBuilder.createGameDTO();
            Game expected = TestDataBuilder.defaultGame().build();
            when(gameRepository.save(any(Game.class))).thenReturn(expected);

            // When
            Game result = serviceUnderTest.createGame(dto);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo(dto.getName());
            verify(gameRepository).save(any(Game.class));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"  "})
        @DisplayName("Should throw exception for invalid name")
        void testCreateGame_InvalidName_ThrowsException(String invalidName) {
            // Given
            GameDTO dto = TestDataBuilder.createGameDTO();
            dto.setName(invalidName);

            // When & Then
            assertThrows(ValidationException.class, () -> serviceUnderTest.createGame(dto));
            verify(gameRepository, never()).save(any(Game.class));
        }
    }

    @Nested
    @DisplayName("Find Game Tests")
    class FindGameTests {

        @Test
        @DisplayName("Should find game by ID")
        void testFindById_ExistingGame_ReturnsGame() {
            // Given
            String gameId = "test_game";
            Game expected = TestDataBuilder.defaultGame().id(gameId).build();
            when(gameRepository.findById(gameId)).thenReturn(Optional.of(expected));

            // When
            Optional<Game> result = serviceUnderTest.findById(gameId);

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(gameId);
        }

        @Test
        @DisplayName("Should return empty for non-existent game")
        void testFindById_NonExistentGame_ReturnsEmpty() {
            // Given
            when(gameRepository.findById(anyString())).thenReturn(Optional.empty());

            // When
            Optional<Game> result = serviceUnderTest.findById("nonexistent");

            // Then
            assertThat(result).isEmpty();
        }
    }
}
```

---

**Last Updated**: 2026-01-10
