// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o estado do personagem
export function initCharacter(state) {
    // Garantir que o estado do personagem existe
    state.character = state.character || {
        age: 0,
        health: 100,
        mood: 50,
        hunger: 50,
        thirst: 50,
        energy: 100,
        strength: 10,
        stamina: 10,
        agility: 10
    };
    state.resources = state.resources || { coins: 0, followers: 0 };

    // Atualizar interface
    updateCharacterUI(state);

    // Adicionar acessibilidade
    addAriaLabels();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface do personagem
function updateCharacterUI(state) {
    document.getElementById('age').textContent = state.character.age;
    document.getElementById('health').textContent = state.character.health;
    document.getElementById('mood').textContent = state.character.mood;
    document.getElementById('hunger').textContent = state.character.hunger;
    document.getElementById('thirst').textContent = state.character.thirst;
    document.getElementById('energy').textContent = state.character.energy;
    document.getElementById('strength').textContent = state.character.strength;
    document.getElementById('stamina').textContent = state.character.stamina;
    document.getElementById('agility').textContent = state.character.agility;
    document.getElementById('coins').textContent = state.resources.coins;
    document.getElementById('followers').textContent = state.resources.followers;

    // Verificar condições críticas
    checkCriticalConditions(state);
}

// Verifica condições críticas (ex.: saúde baixa, fome alta)
function checkCriticalConditions(state) {
    if (state.character.health <= 20) {
        notify('⚠️ Saúde crítica! Visite um médico.');
    }
    if (state.character.hunger >= 80) {
        notify('🍽️ Fome alta! Coma algo.');
    }
    if (state.character.thirst >= 80) {
        notify('💧 Sede alta! Beba água.');
    }
    if (state.character.energy <= 20) {
        notify('⚡ Energia baixa! Descanse.');
    }
}

// Função para atualizar o estado do personagem (ex.: após ações)
export function updateCharacter(state, updates) {
    // Atualizar atributos do personagem
    state.character = { ...state.character, ...updates.character };
    state.resources = { ...state.resources, ...updates.resources };

    // Garantir limites
    state.character.health = Math.max(0, Math.min(100, state.character.health));
    state.character.mood = Math.max(0, Math.min(100, state.character.mood));
    state.character.hunger = Math.max(0, Math.min(100, state.character.hunger));
    state.character.thirst = Math.max(0, Math.min(100, state.character.thirst));
    state.character.energy = Math.max(0, Math.min(100, state.character.energy));
    state.character.strength = Math.max(0, state.character.strength);
    state.character.stamina = Math.max(0, state.character.stamina);
    state.character.agility = Math.max(0, state.character.agility);
    state.resources.coins = Math.max(0, state.resources.coins);
    state.resources.followers = Math.max(0, state.resources.followers);

    // Atualizar interface
    updateCharacterUI(state);

    // Salvar estado
    saveToLocalStorage(state);
}

// Função para avançar a idade do personagem (chamada por calendar.js)
export function ageCharacter(state) {
    state.character.age += 1;
    updateCharacterUI(state);
    saveToLocalStorage(state);
    notify(`🎉 Parabéns! Você agora tem ${state.character.age} anos!`);
}
