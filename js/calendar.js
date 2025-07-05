// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog, formatDate } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;
import { updateFarm } from `${BASE_PATH}/js/farm.js`;

// Inicializa o sistema de calendário
export function initCalendar(state) {
    debugLog('Inicializando calendário', { state });
    state.calendar = state.calendar || {
        currentDate: Date.now(),
        dayCount: 1
    };

    updateCalendar(state);
    saveToLocalStorage(state);
}

// Atualiza o calendário e sistemas dependentes
export function updateCalendar(state) {
    debugLog('Atualizando calendário', { currentDate: state.calendar.currentDate, dayCount: state.calendar.dayCount });
    const calendarSection = document.createElement('div');
    calendarSection.id = 'calendar';
    calendarSection.setAttribute('role', 'region');
    calendarSection.setAttribute('aria-label', 'Calendário');
    calendarSection.innerHTML = `
        <h2>Calendário 📅</h2>
        <p id="calendar-info" aria-live="polite">
            Data: ${formatDate(state.calendar.currentDate)}<br>
            Dia: ${state.calendar.dayCount}
        </p>
    `;

    // Substituir ou adicionar a seção na interface
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para calendário');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }
    const existingSection = document.getElementById('calendar');
    if (existingSection) {
        existingSection.replaceWith(calendarSection);
        debugLog('Seção #calendar substituída');
    } else {
        gameContainer.appendChild(calendarSection);
        debugLog('Seção #calendar adicionada ao #game');
    }

    // Atualizar sistemas dependentes do tempo (ex.: farm.js)
    updateFarm(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    debugLog('Calendário atualizado na interface', { date: formatDate(state.calendar.currentDate), dayCount: state.calendar.dayCount });
}