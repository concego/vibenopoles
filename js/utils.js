// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Carrega o estado do localStorage
export function loadFromLocalStorage() {
    try {
        const state = JSON.parse(localStorage.getItem('vibenopolesState')) || {};
        return state;
    } catch (error) {
        console.error('Erro ao carregar estado do localStorage:', error);
        return {};
    }
}

// Salva o estado no localStorage
export function saveToLocalStorage(state) {
    try {
        localStorage.setItem('vibenopolesState', JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar estado no localStorage:', error);
        notify('⚠️ Erro ao salvar o progresso do jogo.', 'assertive');
    }
}

// Exibe notificações na interface
export function notify(message, ariaLive = 'polite') {
    const notificationArea = document.getElementById('notifications');
    if (!notificationArea) {
        console.warn('Área de notificações não encontrada.');
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', ariaLive);
    notification.textContent = message;

    notificationArea.appendChild(notification);

    // Remover notificação após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Gera um número aleatório entre min e max
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Formata a data para exibição (ex.: usada em calendar.js)
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
