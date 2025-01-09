const recipeDetails = {
    "Apple Cinnamon Pancakes": {
        ingredients: ["apple", "flour", "cinnamon", "milk"],
        difficulty: 2,
        category: "breakfast",
        time: 20,
        image: "apple_pancakes.jpg",
        steps: [
            "Mix flour, baking powder, and cinnamon",
            "Whisk milk, eggs, and melted butter separately",
            "Combine wet and dry ingredients",
            "Fold in diced apples",
            "Cook on griddle until golden brown"
        ]
    },
    "Banana Bread": {
        ingredients: ["banana", "flour", "eggs", "butter"],
        difficulty: 2,
        category: "breakfast",
        time: 60,
        image: "banana_bread.jpg",
        steps: [
            "Mash ripe bananas",
            "Cream butter and sugar",
            "Mix in eggs and vanilla",
            "Fold in flour mixture",
            "Bake for 50-60 minutes"
        ]
    },
    "Carrot Ginger Soup": {
        ingredients: ["carrot", "ginger", "onion", "broth"],
        difficulty: 3,
        category: "soups",
        time: 40,
        image: "carrot_soup.jpg",
        steps: [
            "Sauté onions until translucent",
            "Add carrots and ginger",
            "Pour in vegetable broth",
            "Simmer until carrots are tender",
            "Blend until smooth"
        ]
    },
    "Broccoli Stir Fry": {
        ingredients: ["broccoli", "garlic", "soy sauce", "ginger"],
        difficulty: 2,
        category: "mains",
        time: 25,
        image: "broccoli_stirfry.jpg",
        steps: [
            "Cut broccoli into florets",
            "Heat oil in wok",
            "Stir-fry garlic and ginger",
            "Add broccoli and sauce",
            "Cook until tender-crisp"
        ]
    }
};

const recipeInstructions = {
    "Apple Cinnamon Pancakes": {
        title: "Apple Cinnamon Pancakes",
        image: "apple_pancakes.jpg",
        duration: "20 mins",
        difficulty: "Easy",
        keyIngredient: "2 fresh apples, diced",
        ingredients: [
            "2 fresh apples, diced",
            "2 cups flour",
            "2 tsp cinnamon",
            "2 cups milk",
            "2 eggs"
        ],
        instructions: [
            "Mix dry ingredients",
            "Combine wet ingredients",
            "Fold in diced apples",
            "Cook on medium heat",
            "Serve warm"
        ]
    },
    "Banana Bread": {
        title: "Banana Bread",
        image: "banana_bread.jpg",
        duration: "60 mins",
        difficulty: "Easy",
        keyIngredient: "3 ripe bananas, mashed",
        ingredients: [
            "3 ripe bananas, mashed",
            "1½ cups flour",
            "½ cup sugar",
            "1 egg",
            "⅓ cup butter"
        ],
        instructions: [
            "Mash bananas",
            "Mix wet ingredients",
            "Add dry ingredients",
            "Pour in pan",
            "Bake 50 mins"
        ]
    },
    "Carrot Ginger Soup": {
        title: "Carrot Ginger Soup",
        image: "carrot_soup.jpg",
        duration: "40 mins",
        difficulty: "Medium",
        keyIngredient: "1 pound fresh carrots",
        ingredients: [
            "1 pound fresh carrots",
            "Fresh ginger",
            "Onion",
            "Broth",
            "Cream optional"
        ],
        instructions: [
            "Sauté vegetables",
            "Add broth",
            "Simmer 20 mins",
            "Blend smooth",
            "Season to taste"
        ]
    },
    "Broccoli Stir Fry": {
        title: "Broccoli Stir Fry",
        image: "broccoli_stirfry.jpg",
        duration: "25 mins",
        difficulty: "Easy",
        keyIngredient: "2 fresh broccoli heads",
        ingredients: [
            "2 fresh broccoli heads",
            "Garlic",
            "Ginger",
            "Soy sauce",
            "Oil"
        ],
        instructions: [
            "Heat wok",
            "Stir-fry aromatics",
            "Add broccoli",
            "Season with sauce",
            "Cook until done"
        ]
    }
};

let activeFilters = {
    categories: new Set(),
    difficulty: null,
    timeRange: null
};

const defaultHistory = ['apple', 'carrot', 'broccoli', 'banana'];
let searchHistory = [];
let recognition = null;
let isListening = false;

const voiceFeedback = document.getElementById('voice-feedback');
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');
const searchInput = document.getElementById('searchInput');

function initializeLayout() {
    const mainContent = document.querySelector('.main-content');
    const searchSection = document.querySelector('.search-section');
    const logo = document.querySelector('.logo');
    
    mainContent.classList.add('initially-hidden');
    searchSection.classList.add('centered-search');
    logo.classList.add('logo-large');
    
    initializeHistory();
}

function initializeHistory() {
    if (!localStorage.getItem('searchHistory')) {
        const uniqueHistory = [...new Set(defaultHistory)];
        localStorage.setItem('searchHistory', JSON.stringify(uniqueHistory));
    }
    searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    updateSearchHistory();
}

function updateSearchHistory() {
    const historyList = document.getElementById('searchHistoryList');
    historyList.innerHTML = searchHistory
        .map(term => {
            let imageSrc = 'ingredient_default.jpg';
            for (let recipe in recipeDetails) {
                if (recipeDetails[recipe].ingredients.includes(term.toLowerCase())) {
                    imageSrc = recipeDetails[recipe].image;
                    break;
                }
            }
            
            return `
                <div class="search-history-item" data-term="${term}">
                    <img src="${imageSrc}" alt="${term}" class="history-image">
                    <span class="history-text">${term}</span>
                    <button class="remove-history" aria-label="Remove ${term}">×</button>
                </div>
            `;
        })
        .join('');

    document.querySelectorAll('.search-history-item').forEach(item => {
        const term = item.dataset.term;
        const removeBtn = item.querySelector('.remove-history');
        
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-history')) {
                searchInput.value = term;
                performSearch(term);
                showMainContent();
            }
        });

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromHistory(term);
        });
    });
}

function isSuccessfulSearch(term) {
    for (let recipe in recipeDetails) {
        if (recipe.toLowerCase().includes(term.toLowerCase()) || 
            recipeDetails[recipe].ingredients.some(ing => ing.includes(term.toLowerCase()))) {
            return true;
        }
    }
    
    const videos = document.querySelectorAll('.video-card');
    for (let video of videos) {
        if (video.querySelector('.video-title').textContent.toLowerCase().includes(term.toLowerCase())) {
            return true;
        }
    }
    
    return false;
}

function addToSearchHistory(term) {
    if (term.trim() === '') return;
    
    if (!isSuccessfulSearch(term)) return;
    
    searchHistory = searchHistory.filter(item => item !== term);
    searchHistory.unshift(term);
    
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    updateSearchHistory();
}

function removeFromHistory(term) {
    searchHistory = searchHistory.filter(item => item !== term);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    updateSearchHistory();
}

function showMainContent() {
    const mainContent = document.querySelector('.main-content');
    const searchSection = document.querySelector('.search-section');
    const logo = document.querySelector('.logo');
    
    mainContent.classList.remove('initially-hidden');
    mainContent.classList.add('show');
    searchSection.classList.remove('centered-search');
    logo.classList.remove('logo-large');
}

function showRecipeModal(recipeName) {
    const recipe = recipeInstructions[recipeName];
    if (!recipe) return;

    const modal = document.getElementById('recipe-modal');
    const overlay = document.getElementById('overlay');

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${recipe.title}</h2>
                <div class="recipe-meta-info">
                    <span class="duration">⏱ ${recipe.duration}</span>
                    <span class="difficulty">📊 ${recipe.difficulty}</span>
                </div>
            </div>
            <div class="modal-image">
                <img src="${recipe.image}" alt="${recipe.title}">
            </div>
            <div class="modal-body">
                <div class="key-ingredient">
                    <h3>Key Ingredient</h3>
                    <p>${recipe.keyIngredient}</p>
                </div>
                <div class="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="instructions-section">
                    <h3>Instructions</h3>
                    <ol>
                        ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
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
        searchInput.value = transcript;
        searchInput.dispatchEvent(new Event('input'));
        showMainContent();
        if (isSuccessfulSearch(transcript)) {
            addToSearchHistory(transcript);
        }
        showVoiceFeedback(`Searching for: "${transcript}"`);
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

function initializeMicrophone() {
    const micButton = document.querySelector('.mic-icon');
    if (!initializeSpeechRecognition()) {
        micButton.classList.add('disabled');
        micButton.title = 'Voice search is not available in this browser';
        return;
    }
    micButton.addEventListener('click', handleMicClick);
}

function handleMicClick() {
    if (isListening) {
        recognition.stop();
    } else {
        try {
            searchInput.value = '';
            recognition.start();
        } catch (error) {
            showVoiceFeedback('Error starting voice recognition. Please try again.', 'error');
            setTimeout(() => hideVoiceFeedback(), 3000);
        }
    }
}

function initializeSearch() {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            performSearch(searchTerm);
        }, 300);
    });
}

function performSearch(searchTerm) {
    if (searchTerm.trim() !== '') {
        showMainContent();
        if (isSuccessfulSearch(searchTerm)) {
            addToSearchHistory(searchTerm);
        }
    }

    document.querySelectorAll('.recipe-card').forEach(card => {
        const title = card.querySelector('.recipe-title').textContent.toLowerCase();
        const recipe = recipeDetails[card.querySelector('.recipe-title').textContent];
        const ingredients = recipe ? recipe.ingredients.join(' ').toLowerCase() : '';
        const matches = title.includes(searchTerm) || ingredients.includes(searchTerm);
        
        card.classList.toggle('visible', matches || searchTerm === '');
    });

    document.querySelectorAll('.video-card').forEach(card => {
        const title = card.querySelector('.video-title').textContent.toLowerCase();
        const matches = title.includes(searchTerm);
        card.style.display = searchTerm === '' || matches ? 'block' : 'none';
    });

    updateNoResultsMessage(searchTerm);
}

function updateNoResultsMessage(searchTerm) {
    const visibleRecipes = document.querySelectorAll('.recipe-card.visible').length;
    const visibleVideos = Array.from(document.querySelectorAll('.video-card'))
        .filter(card => card.style.display !== 'none').length;

    let noResults = document.querySelector('.no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        document.querySelector('.main-content').appendChild(noResults);
    }

    if (searchTerm !== '' && visibleRecipes === 0 && visibleVideos === 0) {
        noResults.textContent = 'No matching recipes or videos found';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
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

    initializeFilterOptions();
}

function initializeFilterOptions() {
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
            activeFilters.difficulty = wasActive ? null : btn.dataset.difficulty;
            if (!wasActive) btn.classList.add('active');
            applyFilters();
        });
    });

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            activeFilters.timeRange = wasActive ? null : btn.dataset.time;
            if (!wasActive) btn.classList.add('active');
            applyFilters();
        });
    });
}

function applyFilters() {
    const recipes = document.querySelectorAll('.recipe-card');
    
    recipes.forEach(recipe => {
        const title = recipe.querySelector('.recipe-title').textContent;
        const recipeData = recipeDetails[title];
        let showRecipe = true;

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

        if (recipe.classList.contains('visible')) {
            recipe.classList.toggle('visible', showRecipe);
        }
    });

    updateNoResultsMessage(searchInput.value);
}

function initialize() {
    initializeLayout();
    initializeSearch();
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