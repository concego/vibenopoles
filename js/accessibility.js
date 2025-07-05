// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;

// Inicializa o sistema de acessibilidade
export function initAccessibility(state) {
    // Garantir que o estado de acessibilidade existe
    state.settings = state.settings || {
        highContrast: false,
        fontSize: 'medium', // Opções: small, medium, large
        screenReaderSupport: true
    };

    // Aplicar configurações iniciais
    applyAccessibilitySettings(state);

    // Adicionar listeners para navegação por teclado
    setupKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Aplica configurações de acessibilidade
function applyAccessibilitySettings(state) {
    const root = document.documentElement;

    // Modo de alto contraste
    if (state.settings.highContrast) {
        root.classList.add('high-contrast');
        notify('🖼️ Modo de alto contraste ativado.', 'assertive');
    } else {
        root.classList.remove('high-contrast');
    }

    // Tamanho da fonte
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${state.settings.fontSize}`);

    // Suporte a leitores de tela
    if (state.settings.screenReaderSupport) {
        document.body.setAttribute('aria-hidden', 'false');
        notify('📢 Suporte a leitores de tela ativado.', 'assertive');
    }
}

// Adiciona atributos ARIA a elementos dinâmicos
export function addAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label')) {
            const text = element.textContent.trim() || element.getAttribute('title') || 'Interagir';
            element.setAttribute('aria-label', text);
        }
        element.setAttribute('tabindex', '0'); // Garantir foco por teclado
    });

    // Garantir que seções dinâmicas tenham ARIA
    const sections = document.querySelectorAll('[role="region"]');
    sections.forEach(section => {
        if (!section.getAttribute('aria-label')) {
            section.setAttribute('aria-label', section.id || 'Seção do jogo');
        }
    });
}

// Configura navegação por teclado
export function handleKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);

        if (event.key === 'Tab') {
            event.preventDefault();
            let nextIndex = currentIndex + (event.shiftKey ? -1 : 1);
            if (nextIndex >= focusableArray.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = focusableArray.length - 1;
            focusableArray[nextIndex].focus();
        }

        if (event.key === 'Enter' || event.key === ' ') {
            if (document.activeElement.tagName === 'BUTTON' || document.activeElement.getAttribute('role') === 'button') {
                document.activeElement.click();
            }
        }
    });
}

// Função para alternar alto contraste
window.toggleHighContrast = function() {
    const state = loadFromLocalStorage();
    state.settings.highContrast = !state.settings.highContrast;
    applyAccessibilitySettings(state);
    saveToLocalStorage(state);
    notify(`🖼️ Modo de alto contraste ${state.settings.highContrast ? 'ativado' : 'desativado'}.`, 'assertive');
};

// Função para alterar tamanho da fonte
window.setFontSize = function(size) {
    const state = loadFromLocalStorage();
    if (['small', 'medium', 'large'].includes(size)) {
        state.settings.fontSize = size;
        applyAccessibilitySettings(state);
        saveToLocalStorage(state);
        notify(`🔤 Tamanho da fonte alterado para ${size}.`, 'assertive');
    }
};

// Função para ativar/desativar suporte a leitores de tela
window.toggleScreenReaderSupport = function() {
    const state = loadFromLocalStorage();
    state.settings.screenReaderSupport = !state.settings.screenReaderSupport;
    applyAccessibilitySettings(state);
    saveToLocalStorage(state);
    notify(`📢 Suporte a leitores de tela ${state.settings.screenReaderSupport ? 'ativado' : 'desativado'}.`, 'assertive');
};
