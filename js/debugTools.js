// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog, formatDate } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;
import { updateCalendar } from `${BASE_PATH}/js/calendar.js`;

// Inicializa as ferramentas de teste
export function initDebugTools(state) {
    debugLog('Inicializando ferramentas de teste', { debugMode: state.settings.debugMode });
    if (!state.settings.debugMode) {
        const debugToolsSection = document.getElementById('debug-tools');
        if (debugToolsSection) debugToolsSection.style.display = 'none';
        return;
    }

    // Exibir seção de ferramentas de teste
    updateDebugToolsUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface das ferramentas de teste
function updateDebugToolsUI(state) {
    const debugToolsSection = document.createElement('section');
    debugToolsSection.id = 'debug-tools';
    debugToolsSection.setAttribute('role', 'region');
    debugToolsSection.setAttribute('aria-label', 'Ferramentas de Depuração');
    debugToolsSection.innerHTML = `
        <h2>Ferramentas de Depuração 🛠️</h2>
        <p>Disponível apenas no modo de depuração.</p>
        <h3>Controle de Calendário</h3>
        <button onclick="advanceCalendar(1)" aria-label="Avançar calendário em 1 dia">+1 Dia</button>
        <button onclick="advanceCalendar(7)" aria-label="Avançar calendário em 1 semana">+1 Semana</button>
        <button onclick="resetState()" aria-label="Resetar estado do jogo">Resetar Estado</button>
    `;

    // Substituir ou adicionar a seção no rodapé
    const footer = document.querySelector('footer');
    const existingSection = document.getElementById('debug-tools');
    if (existingSection) {
        existingSection.replaceWith(debugToolsSection);
        debugLog('Seção #debug-tools substituída');
    } else {
        footer.insertBefore(debugToolsSection, footer.firstChild);
        debugLog('Seção #debug-tools adicionada ao rodapé');
    }
}

// Função para avançar o calendário
window.advanceCalendar = function(days) {
    const state = loadFromLocalStorage();
    debugLog('Avançando calendário', { days });

    // Atualizar o calendário
    state.calendar = state.calendar || { currentDate: Date.now(), dayCount: 1 };
    state.calendar.currentDate += days * 24 * 60 * 60 * 1000; // Avançar em milissegundos
    state.calendar.dayCount = (state.calendar.dayCount || 1) + days;

    // Atualizar sistemas dependentes do tempo
    updateCalendar(state);
    notify(`📅 Calendário avançado em ${days} dia(s). Data atual: ${formatDate(state.calendar.currentDate)}`, 'assertive');

    // Salvar estado e atualizar interface
    saveToLocalStorage(state);
    updateDebugToolsUI(state);
};

// Função para resetar o estado do jogo
window.resetState = function() {
    const state = loadFromLocalStorage();
    debugLog('Resetando estado do jogo');
    localStorage.removeItem('vibenopolesState');
    state.character = { created: false };
    state.calendar = { currentDate: Date.now(), dayCount: 1 };
    notify('🔄 Estado do jogo resetado.', 'assertive');
    saveToLocalStorage(state);
    window.location.reload(); // Recarregar para reinicializar
};
