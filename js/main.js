// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage } from `${BASE_PATH}/js/utils.js`;
import { initCharacter } from `${BASE_PATH}/js/character.js`;
import { initFarm } from `${BASE_PATH}/js/farm.js`;
import { initTrade } from `${BASE_PATH}/js/trade.js`;
import { initInventory } from `${BASE_PATH}/js/inventory.js`;
import { initAccessibility } from `${BASE_PATH}/js/accessibility.js`;
import { initCalendar } from `${BASE_PATH}/js/calendar.js`;
import { initDebugTools } from `${BASE_PATH}/js/debugTools.js`;

// Inicializa o jogo
function initGame() {
    const state = loadFromLocalStorage();
    initCharacter(state);
    initFarm(state);
    initTrade(state);
    initInventory(state);
    initCalendar(state);
    initAccessibility(state);
    initDebugTools(state);
    saveToLocalStorage(state);
}

// Iniciar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', initGame);