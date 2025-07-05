// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { addAriaLabels } from `${BASE_PATH}/js/accessibility.js`;

// Carrega o estado do localStorage
export function loadFromLocalStorage() {
    try {
        const state = JSON.parse(localStorage.getItem('vibenopolesState')) || {};
        debugLog('Estado carregado do localStorage', state);
        return state;
    } catch (error) {
        console.error('Erro ao carregar estado do localStorage:', error);
        debugLog('Erro ao carregar estado do localStorage', { error });
        return {};
    }
}

// Salva o estado no localStorage
export function saveToLocalStorage(state) {
    try {
        localStorage.setItem('vibenopolesState', JSON.stringify(state));
        debugLog('Estado salvo no localStorage', state);
    } catch (error) {
        console.error('Erro ao salvar estado no localStorage:', error);
        debugLog('Erro ao salvar estado do localStorage', { error });
        notify('⚠️ Erro ao salvar o progresso do jogo.', 'assertive');
    }
}

// Exibe notificações na interface
export function notify(message, ariaLive = 'polite') {
    const notificationArea = document.getElementById('notifications');
    if (!notificationArea) {
        console.warn('Área de notificações não encontrada.');
        debugLog('Área de notificações não encontrada', { message });
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', ariaLive);
    notification.textContent = message;

    notificationArea.appendChild(notification);
    debugLog('Notificação exibida', { message, ariaLive });

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Gera um número aleatório entre min e max
export function randomInt(min, max) {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    debugLog('Número aleatório gerado', { min, max, result });
    return result;
}

// Formata a data para exibição
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    const formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    debugLog('Data formatada', { timestamp, formatted });
    return formatted;
}

// Função de log de depuração
export function debugLog(message, data = {}) {
    const state = loadFromLocalStorage();
    if (!state.settings || !state.settings.debugMode) return;

    const timestamp = new Date().toLocaleString('pt-BR');
    const logMessage = `[DEBUG ${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`;
    console.log(logMessage);

    const debugArea = document.getElementById('debug-log');
    if (debugArea) {
        const logEntry = document.createElement('div');
        logEntry.className = 'debug-entry';
        logEntry.setAttribute('role', 'log');
        logEntry.setAttribute('aria-live', 'polite');
        logEntry.textContent = logMessage;
        debugArea.appendChild(logEntry);

        while (debugArea.children.length > 50) {
            debugArea.removeChild(debugArea.firstChild);
        }

        addAriaLabels();
    }
}