const recipeDetails = {
    "Quick Apple Muffins": {
        ingredients: ["apple", "flour", "cinnamon", "sugar"],
        difficulty: 2,
        category: "desserts",
        time: 12,
        image: "apple_muffins.jpg",
        steps: [
            "Mix dry ingredients in a bowl",
            "Combine wet ingredients separately",
            "Fold in diced apples",
            "Fill muffin cups",
            "Bake for 10 minutes"
        ]
    },
    "Carrot Cookie Bites": {
        ingredients: ["carrot", "oats", "honey", "cinnamon"],
        difficulty: 2,
        category: "desserts",
        time: 12,
        image: "carrot_cookies.jpg",
        steps: [
            "Grate carrots finely",
            "Mix with oats and honey",
            "Form small balls",
            "Press into cookies",
            "Bake for 10 minutes"
        ]
    },
    "Apple Cinnamon Pancakes": {
        ingredients: ["apple", "flour", "cinnamon", "milk"],
        difficulty: 2,
        category: "breakfast",
        time: 20,
        image: "apple_pancakes.jpg",
        steps: [
            "Mix dry ingredients",
            "Combine wet ingredients",
            "Fold in diced apples",
            "Cook on medium heat",
            "Serve warm"
        ]
    },
    "Carrot Ginger Soup": {
        ingredients: ["carrot", "ginger", "onion", "broth"],
        difficulty: 3,
        category: "soups",
        time: 40,
        image: "carrot_soup.jpg",
        steps: [
            "Sauté vegetables",
            "Add broth",
            "Simmer 20 mins",
            "Blend smooth",
            "Season to taste"
        ]
    }
};

const videoPlaceholders = [
    {
        title: "Quick Apple Desserts",
        duration: "5:45",
        thumbnail: "apple_desserts_video.jpg"
    },
    {
        title: "Easy Carrot Treats",
        duration: "4:30",
        thumbnail: "carrot_treats_video.jpg"
    },
    {
        title: "15-Minute Fruit Recipes",
        duration: "6:15",
        thumbnail: "quick_fruits_video.jpg"
    }
];

let activeFilters = {
    categories: new Set(),
    difficulty: null,
    timeRange: null
};

let searchTerms = new Set();
let recognition = null;
let isListening = false;

const voiceFeedback = document.getElementById('voice-feedback');
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');
const searchInput = document.getElementById('searchInput');

function initializeLayout() {
    const mainContent = document.querySelector('.main-content');
    const searchSection = document.querySelector('.search-section');
    
    mainContent.classList.add('initially-hidden');
    searchSection.classList.add('centered-search');
    
    // Clear search input on page load
    searchInput.value = '';
    
    // Initialize video section
    updateVideoSection();
}

function updateVideoSection() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    videoContainer.innerHTML = videoPlaceholders.map(video => `
        <div class="video-card hidden">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <span class="video-duration">${video.duration}</span>
            </div>
            <h3 class="video-title">${video.title}</h3>
        </div>
    `).join('');
}

function initializeFilterPanel() {
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterPanel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
            filterPanel.classList.remove('active');
        }
    });

    // Update filter handlers for the specific workflow
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeFilters.categories.add(checkbox.id);
            } else {
                activeFilters.categories.delete(checkbox.id);
            }
            applyFilters();
        });
    });

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            if (!wasActive) {
                btn.classList.add('active');
                activeFilters.difficulty = btn.dataset.difficulty;
            } else {
                activeFilters.difficulty = null;
            }
            applyFilters();
        });
    });

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            if (!wasActive) {
                btn.classList.add('active');
                activeFilters.timeRange = btn.dataset.time;
            } else {
                activeFilters.timeRange = null;
            }
            applyFilters();
        });
    });
}

function performSearch(searchTerm) {
    if (!searchTerm) {
        searchTerms.clear();
    } else {
        searchTerms.add(searchTerm.toLowerCase());
    }

    const combinedSearch = Array.from(searchTerms).join(' ');
    searchInput.value = combinedSearch;

    const recipes = document.querySelectorAll('.recipe-card');
    const videos = document.querySelectorAll('.video-card');
    let hasResults = false;

    if (combinedSearch.trim() !== '') {
        showMainContent();
    }

    recipes.forEach(card => {
        const title = card.querySelector('.recipe-title').textContent.toLowerCase();
        const recipe = recipeDetails[card.querySelector('.recipe-title').textContent];
        const ingredients = recipe ? recipe.ingredients.join(' ').toLowerCase() : '';
        
        const matches = searchTerms.size === 0 || 
            Array.from(searchTerms).every(term => 
                title.includes(term) || ingredients.includes(term)
            );
        
        card.classList.toggle('hidden', !matches);
        if (matches) hasResults = true;
    });

    videos.forEach(card => {
        const title = card.querySelector('.video-title').textContent.toLowerCase();
        const matches = searchTerms.size === 0 ||
            Array.from(searchTerms).some(term => title.includes(term));
        card.classList.toggle('hidden', !matches);
        if (matches) hasResults = true;
    });

    applyFilters();

    if (searchTerms.size > 0 && !hasResults) {
        showNoResults();
    } else {
        hideNoResults();
    }
}

function applyFilters() {
    const recipes = document.querySelectorAll('.recipe-card');
    
    recipes.forEach(recipe => {
        if (recipe.classList.contains('hidden')) return;

        let showRecipe = true;
        const recipeData = recipeDetails[recipe.querySelector('.recipe-title').textContent];

        if (activeFilters.categories.size > 0) {
            showRecipe = activeFilters.categories.has(recipeData.category);
        }

        if (showRecipe && activeFilters.difficulty) {
            const difficultyMap = {
                'easy': [1, 2],
                'medium': [3, 4],
                'advanced': [5]
            };
            showRecipe = difficultyMap[activeFilters.difficulty].includes(recipeData.difficulty);
        }

        if (showRecipe && activeFilters.timeRange) {
            const time = recipeData.time;
            switch(activeFilters.timeRange) {
                case '<15':
                    showRecipe = time < 15;
                    break;
                case '15-30':
                    showRecipe = time >= 15 && time <= 30;
                    break;
                case '>30':
                    showRecipe = time > 30;
                    break;
            }
        }

        recipe.classList.toggle('hidden', !showRecipe);
    });
}

function initializeSpeechRecognition() {
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new window.SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        setupRecognitionHandlers();
        return true;
    } catch(e) {
        return false;
    }
}

function setupRecognitionHandlers() {
    recognition.onstart = () => {
        isListening = true;
        showVoiceFeedback('Listening...');
        document.querySelector('.mic-icon').classList.add('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .trim();
        
        // Handle individual words from voice input
        const words = transcript.split(' ');
        words.forEach(word => {
            if (word === 'apple' || word === 'carrot') {
                performSearch(word);
            }
        });

        showVoiceFeedback(`Added: "${transcript}"`);
        setTimeout(() => hideVoiceFeedback(), 2000);
    };

    recognition.onerror = (event) => {
        let errorMessage = 'Could not recognize speech. Please try again.';
        if (event.error === 'network') {
            errorMessage = 'Network error. Please check your connection.';
        } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try again.';
        }
        showVoiceFeedback(errorMessage, 'error');
        setTimeout(() => hideVoiceFeedback(), 3000);
    };

    recognition.onend = () => {
        isListening = false;
        document.querySelector('.mic-icon').classList.remove('listening');
    };
}

function showVoiceFeedback(message, type = '') {
    voiceFeedback.textContent = message;
    voiceFeedback.className = `voice-feedback active ${type}`;
    voiceFeedback.style.display = 'block';
}

function hideVoiceFeedback() {
    voiceFeedback.style.display = 'none';
    voiceFeedback.className = 'voice-feedback';
}

function showMainContent() {
    const mainContent = document.querySelector('.main-content');
    const searchSection = document.querySelector('.search-section');
    
    mainContent.classList.remove('initially-hidden');
    mainContent.classList.add('show');
    searchSection.classList.remove('centered-search');
}

function showNoResults() {
    let noResults = document.querySelector('.no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No matching recipes or videos found';
        document.querySelector('.main-content').appendChild(noResults);
    }
    noResults.style.display = 'block';
}

function hideNoResults() {
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
}

function handleMicClick() {
    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (error) {
            showVoiceFeedback('Error starting voice recognition. Please try again.', 'error');
            setTimeout(() => hideVoiceFeedback(), 3000);
        }
    }
}

function initializeMicrophone() {
    const micButton = document.querySelector('.mic-icon');
    if (!initializeSpeechRecognition()) {
        micButton.classList.add('disabled');
        micButton.title = 'Voice search is not available in this browser';
        return;
    }
    micButton.addEventListener('click', handleMicClick);
}

function showRecipeModal(recipeName) {
    const recipe = recipeDetails[recipeName];
    if (!recipe) return;

    const modal = document.getElementById('recipe-modal');
    const overlay = document.getElementById('overlay');

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${recipeName}</h2>
                <div class="recipe-meta-info">
                    <span class="duration">⏱ ${recipe.time} mins</span>
                    <span class="difficulty">📊 ${'★'.repeat(recipe.difficulty)}${'☆'.repeat(5-recipe.difficulty)}</span>
                </div>
            </div>
            <div class="modal-image">
                <img src="${recipe.image}" alt="${recipeName}">
            </div>
            <div class="modal-body">
                <div class="ingredients-section">
                    <h3>Main Ingredients</h3>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="instructions-section">
                    <h3>Instructions</h3>
                    <ol>
                        ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            </div>
            <button class="modal-close">×</button>
        </div>
    `;

    modal.style.display = 'block';
    overlay.style.display = 'block';

    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}

function closeModal() {
    const modal = document.getElementById('recipe-modal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

function initializeRecipeCards() {
    document.querySelectorAll('.recipe-card').forEach(card => {
        const playButton = card.querySelector('.play-button');
        const recipeName = card.querySelector('.recipe-title').textContent;
        playButton.addEventListener('click', () => showRecipeModal(recipeName));
    });
}

function initialize() {
    initializeLayout();
    initializeFilterPanel();
    initializeMicrophone();
    initializeRecipeCards();
}

document.addEventListener('DOMContentLoaded', initialize);

document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
        this.src = 'placeholder.png';
        this.alt = 'Image not available';
    };
});