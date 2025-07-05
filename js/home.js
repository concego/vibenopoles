// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema do lar
export function initHome(state) {
    // Garantir que o estado do lar existe (sincronizado com family.js)
    state.family = state.family || {
        homeStatus: {
            cleanliness: 50,
            comfort: 50,
            upgrades: { kitchen: 1, bedroom: 1 } // Nível dos cômodos
        }
    };

    // Atualizar interface
    updateHomeUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface do lar
function updateHomeUI(state) {
    const homeSection = document.createElement('div');
    homeSection.id = 'home';
    homeSection.setAttribute('role', 'region');
    homeSection.setAttribute('aria-label', 'Lar Familiar');
    homeSection.innerHTML = `
        <h2>Lar Familiar 🏠</h2>
        <p id="home-status" aria-live="polite">
            Limpeza: <span id="cleanliness">${state.family.homeStatus.cleanliness}</span> 🧹 | 
            Conforto: <span id="comfort">${state.family.homeStatus.comfort}</span> 🛋️
        </p>
        <h3>Cômodos</h3>
        <ul id="upgrades" role="list" aria-live="polite">
            <li>Cozinha: Nível <span id="kitchen-level">${state.family.homeStatus.upgrades.kitchen}</span>
                <button onclick="upgradeRoom('kitchen')" aria-label="Melhorar Cozinha">Melhorar</button>
            </li>
            <li>Quarto: Nível <span id="bedroom-level">${state.family.homeStatus.upgrades.bedroom}</span>
                <button onclick="upgradeRoom('bedroom')" aria-label="Melhorar Quarto">Melhorar</button>
            </li>
        </ul>
        <button onclick="cleanHome()" aria-label="Limpar Casa">Limpar Casa</button>
        <button onclick="improveComfort()" aria-label="Melhorar Conforto">Melhorar Conforto</button>
    `;

    // Substituir ou adicionar a seção na interface
    const existingHomeSection = document.getElementById('home');
    if (existingHomeSection) {
        existingHomeSection.replaceWith(homeSection);
    } else {
        document.getElementById('game').appendChild(homeSection);
    }

    // Verificar condições do lar
    checkHomeConditions(state);
}

// Verifica condições do lar (ex.: limpeza baixa)
function checkHomeConditions(state) {
    if (state.family.homeStatus.cleanliness <= 20) {
        notify('🧹 A casa está muito suja! Limpe-a.');
    }
    if (state.family.homeStatus.comfort <= 20) {
        notify('🛋️ A casa está desconfortável! Melhore o conforto.');
    }
}

// Função para limpar a casa
window.cleanHome = function() {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Lar Familiar') {
        notify('⚠️ Vá para o Lar Familiar para limpar a casa.');
        return;
    }
    if (state.character.energy < 10) {
        notify('⚡ Energia insuficiente para limpar a casa.');
        return;
    }

    state.family.homeStatus.cleanliness = Math.min(100, state.family.homeStatus.cleanliness + 20);
    state.character.energy = Math.max(0, state.character.energy - 10);
    notify('🧹 Você limpou a casa! Limpeza: ' + state.family.homeStatus.cleanliness);
    updateHomeUI(state);
    saveToLocalStorage(state);
};

// Função para melhorar o conforto
window.improveComfort = function() {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Lar Familiar') {
        notify('⚠️ Vá para o Lar Familiar para melhorar o conforto.');
        return;
    }
    if (state.resources.coins < 20) {
        notify('⚠️ Você precisa de 20 moedas para melhorar o conforto.');
        return;
    }
    if (state.character.energy < 10) {
        notify('⚡ Energia insuficiente para melhorar o conforto.');
        return;
    }

    state.family.homeStatus.comfort = Math.min(100, state.family.homeStatus.comfort + 15);
    state.resources.coins -= 20;
    state.character.energy = Math.max(0, state.character.energy - 10);
    notify('🛋️ Você melhorou o conforto da casa! Conforto: ' + state.family.homeStatus.comfort);
    updateHomeUI(state);
    saveToLocalStorage(state);
};

// Função para melhorar um cômodo
window.upgradeRoom = function(room) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Lar Familiar') {
        notify('⚠️ Vá para o Lar Familiar para melhorar cômodos.');
        return;
    }
    const cost = state.family.homeStatus.upgrades[room] * 50; // Custo aumenta com o nível
    if (state.resources.coins < cost) {
        notify(`⚠️ Você precisa de ${cost} moedas para melhorar a ${room}.`);
        return;
    }

    state.family.homeStatus.upgrades[room] += 1;
    state.resources.coins -= cost;
    state.family.homeStatus.comfort += 10; // Bônus de conforto
    state.family.homeStatus.cleanliness += 5; // Bônus de limpeza
    notify(`🏠 Você melhorou a ${room} para o nível ${state.family.homeStatus.upgrades[room]}!`);
    updateHomeUI(state);
    saveToLocalStorage(state);
};

// Função para atualizar o estado do lar (ex.: após eventos ou tempo)
export function updateHome(state, updates) {
    state.family.homeStatus = {
        ...state.family.homeStatus,
        ...updates.homeStatus,
        upgrades: { ...state.family.homeStatus.upgrades, ...updates.upgrades }
    };

    // Garantir limites
    state.family.homeStatus.cleanliness = Math.max(0, Math.min(100, state.family.homeStatus.cleanliness));
    state.family.homeStatus.comfort = Math.max(0, Math.min(100, state.family.homeStatus.comfort));

    updateHomeUI(state);
    saveToLocalStorage(state);
}
