/**
 * MUT Improv Games Data Management
 * Handles loading and processing of game data
 */

// Global variables
let allGames = [];
let filteredGames = [];
let categories = new Set();

/**
 * Load games data from JSON file
 */
async function loadGamesData() {
    try {
        const response = await fetch('data/mutgames.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Process the data
        allGames = [];
        categories.clear();

        // Extract games from categories
        data.categories.forEach(category => {
            categories.add(category.name);
            category.games.forEach(game => {
                // Add category information to each game
                game.category = category.name;
                game.categoryId = category.id;
                allGames.push(game);
            });
        });

        // Sort games alphabetically
        allGames.sort((a, b) => a.name.localeCompare(b.name));

        // Initialize filtered games
        filteredGames = [...allGames];

        console.log(`Loaded ${allGames.length} games from ${categories.size} categories`);
        return true;
    } catch (error) {
        console.error('Error loading games data:', error);
        return false;
    }
}

/**
 * Get all unique categories
 */
function getCategories() {
    return Array.from(categories).sort();
}

/**
 * Get game by ID
 */
function getGameById(gameId) {
    return allGames.find(game => game.id === gameId);
}

/**
 * Get games by category
 */
function getGamesByCategory(categoryName) {
    return allGames.filter(game => game.category === categoryName);
}

/**
 * Search games by text
 */
function searchGames(query) {
    if (!query || query.trim() === '') {
        return allGames;
    }

    const searchTerm = query.toLowerCase().trim();
    return allGames.filter(game => {
        // Search in name
        if (game.name.toLowerCase().includes(searchTerm)) return true;

        // Search in description/setup
        if (game.setup && game.setup.description &&
            game.setup.description.toLowerCase().includes(searchTerm)) return true;

        // Search in rules
        if (game.rules && game.rules.some(rule =>
            rule.toLowerCase().includes(searchTerm))) return true;

        // Search in tips
        if (game.tips && game.tips.some(tip => {
            if (typeof tip === 'string') {
                return tip.toLowerCase().includes(searchTerm);
            } else if (tip.role && tip.tips) {
                return tip.tips.some(t =>
                    t.toLowerCase().includes(searchTerm));
            }
            return false;
        })) return true;

        // Search in examples
        if (game.examples && game.examples.some(example =>
            example.toLowerCase().includes(searchTerm))) return true;

        // Search in tags
        if (game.tags && game.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm))) return true;

        // Search in category
        if (game.category && game.category.toLowerCase().includes(searchTerm)) return true;

        return false;
    });
}

/**
 * Filter games by criteria
 */
function filterGames(games, filters) {
    return games.filter(game => {
        // Category filter
        if (filters.category && filters.category !== '' && game.category !== filters.category) {
            return false;
        }

        // Difficulty filter
        if (filters.difficulty && filters.difficulty !== '' && game.difficulty !== filters.difficulty) {
            return false;
        }

        // Player count filter (simplified - could be enhanced)
        if (filters.minPlayers && game.playerCount.min < filters.minPlayers) {
            return false;
        }
        if (filters.maxPlayers && game.playerCount.max > filters.maxPlayers) {
            return false;
        }

        // Audience participation filter
        if (filters.audienceParticipation !== undefined &&
            filters.audienceParticipation !== null &&
            game.audienceParticipation !== filters.audienceParticipation) {
            return false;
        }

        return true;
    });
}

/**
 * Format player count for display
 */
function formatPlayerCount(playerCount) {
    const { min, max, optimal } = playerCount;
    if (min === max) {
        return `${min} players`;
    }
    return `${min}-${max} players (optimal: ${optimal})`;
}

/**
 * Format duration for display
 */
function formatDuration(duration) {
    return duration || 'Not specified';
}

/**
 * Get difficulty color class
 */
function getDifficultyClass(difficulty) {
    switch (difficulty) {
        case 'beginner': return 'text-success';
        case 'intermediate': return 'text-warning';
        case 'advanced': return 'text-danger';
        default: return 'text-muted';
    }
}

/**
 * Get tag color class
 */
function getTagClass(tag) {
    switch (tag) {
        case 'family_friendly': return 'tag-family-friendly';
        case 'jam_friendly': return 'tag-jam-friendly';
        case 'seasonal': return 'tag-seasonal';
        default: return 'badge bg-secondary';
    }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?\/\s]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * Generate YouTube embed URL
 */
function getYouTubeEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

// Export functions for use in other modules
window.GameData = {
    loadGamesData,
    getCategories,
    getGameById,
    getGamesByCategory,
    searchGames,
    filterGames,
    formatPlayerCount,
    formatDuration,
    getDifficultyClass,
    getTagClass,
    extractYouTubeId,
    getYouTubeEmbedUrl,
    get allGames() { return allGames; },
    get filteredGames() { return filteredGames; },
    set filteredGames(value) { filteredGames = value; }
};
