// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importação dos módulos
import { initCharacter } from `${BASE_PATH}/js/character.js`;
import { initFamily } from `${BASE_PATH}/js/family.js`;
import { initNPCs } from `${BASE_PATH}/js/npcs.js`;
import { initLocations } from `${BASE_PATH}/js/locations.js`;
import { initCalendar } from `${BASE_PATH}/js/calendar.js`;
import { initEducation } from `${BASE_PATH}/js/education.js`;
import { initRelationships } from `${BASE_PATH}/js/relationships.js`;
import { initFarm } from `${BASE_PATH}/js/farm.js`;
import { initHome } from `${BASE_PATH}/js/home.js`;
import { initEvents } from `${BASE_PATH}/js/events.js`;
import { initCutscenes } from `${BASE_PATH}/js/cutscenes.js`;
import { initDialogues } from `${BASE_PATH}/js/dialogues.js`;
import { initMissions } from `${BASE_PATH}/js/missions.js`;
import { initTrade } from `${BASE_PATH}/js/trade.js`;
import { initAchievements } from `${BASE_PATH}/js/achievements.js`;
import { loadFromLocalStorage, saveToLocalStorage, updateTimeOffline } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Estado inicial do jogo
let novaVibeState = loadFromLocalStorage() || {
    character: { age: 0, health: 100, mood: 50, hunger: 50, thirst: 50, energy: 100, strength: 10, stamina: 10, agility: 10 },
    resources: { coins: 0, followers: 0 },
    calendar: { day: 1, week: 1, month: 1, year: 1, season: 'Primavera', weather: 'Sol' },
    settings: { highContrast: false, sound: false }
};

// Função para inicializar o jogo
function initGame() {
    // Carregar configurações (ex.: alto contraste)
    applySettings(novaVibeState.settings);

    // Inicializar módulos
    initCharacter(novaVibeState);
    initFamily(novaVibeState);
    initNPCs(novaVibeState);
    initLocations(novaVibeState);
    initCalendar(novaVibeState);
    initEducation(novaVibeState);
    initRelationships(novaVibeState);
    initFarm(novaVibeState);
    initHome(novaVibeState);
    initEvents(novaVibeState);
    initCutscenes(novaVibeState);
    initDialogues(novaVibeState);
    initMissions(novaVibeState);
    initTrade(novaVibeState);
    initAchievements(novaVibeState);

    // Atualizar progresso offline
    updateTimeOffline(novaVibeState);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado inicial
    saveToLocalStorage(novaVibeState);
}

// Aplicar configurações (ex.: alto contraste)
function applySettings(settings) {
    if (settings.highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    // Futuro: aplicar configurações de som
}

// Função global para visitar locais (chamada pelos botões em index.html)
window.visitLocation = function(location) {
    novaVibeState.currentLocation = location;
    saveToLocalStorage(novaVibeState);
    notify(`Você está em: ${location}`);
    // Atualizar interface (ex.: eventos ou missões específicas do local)
    initEvents(novaVibeState);
    initMissions(novaVibeState);
};

// Função global para pular cutscenes (chamada por index.html)
window.skipCutscene = function() {
    document.getElementById('cutscene').hidden = true;
    notify('Cutscene concluída.');
    saveToLocalStorage(novaVibeState);
};

// Função para exibir notificações com acessibilidade
function notify(message) {
    const notifications = document.getElementById('notifications');
    notifications.textContent = message;
    setTimeout(() => notifications.textContent = '', 3000);
}

// Inicializar o jogo ao carregar a página
window.onload = initGame;
