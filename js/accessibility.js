// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog } from `${BASE_PATH}/js/utils.js`;

// Inicializa configurações de acessibilidade
export function initAccessibility(state) {
    debugLog('Inicializando configurações de acessibilidade', { settings: state.settings });
    state.settings = state.settings || {
        highContrast: false,
        fontSize: 'medium',
        screenReaderSupport: true,
        debugMode: false
    };

    applyAccessibilitySettings(state);
    addAriaLabels();
    handleKeyboardNavigation();
    saveToLocalStorage(state);
}

// Aplica configurações de acessibilidade
export function applyAccessibilitySettings(state) {
    debugLog('Aplicando configurações de acessibilidade', { settings: state.settings });
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
    notify(`🔤 Tamanho da fonte ajustado para ${state.settings.fontSize}.`, 'polite');

    // Suporte a leitores de tela
    if (state.settings.screenReaderSupport) {
        document.body.setAttribute('aria-hidden', 'false');
        notify('📢 Suporte a leitores de tela ativado.', 'assertive');
    } else {
        document.body.setAttribute('aria-hidden', 'true');
    }

    // Visibilidade do log de depuração
    updateDebugLogVisibility(state);
}

// Adiciona atributos ARIA dinamicamente
export function addAriaLabels() {
    debugLog('Adicionando atributos ARIA');
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label')) {
            const text = element.textContent.trim() || element.getAttribute('title') || 'Interagir';
            element.setAttribute('aria-label', text);
        }
        element.setAttribute('tabindex', '0');
    });

    const sections = document.querySelectorAll('[role="region"], [role="log"]');
    sections.forEach(section => {
        if (!section.getAttribute('aria-label')) {
            section.setAttribute('aria-label', section.id || 'Seção do jogo');
        }
    });
}

// Gerencia navegação por teclado
export function handleKeyboardNavigation() {
    debugLog('Configurando navegação por teclado');
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

// Atualiza a visibilidade do log de depuração
function updateDebugLogVisibility(state) {
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        debugLog.style.display = state.settings.debugMode ? 'block' : 'none';
        debugLog('Atualizando visibilidade do log de depuração', { debugMode: state.settings.debugMode });
    }
}

// Alterna modo de alto contraste
export function toggleHighContrast() {
    const state = loadFromLocalStorage();
    state.settings.highContrast = !state.settings.highContrast;
    applyAccessibilitySettings(state);
    saveToLocalStorage(state);
}

// Define o tamanho da fonte
export function setFontSize(size) {
    const state = loadFromLocalStorage();
    if (['small', 'medium', 'large'].includes(size)) {
        state.settings.fontSize = size;
        applyAccessibilitySettings(state);
        saveToLocalStorage(state);
    } else {
        debugLog('Tamanho de fonte inválido', { size });
        notify('⚠️ Tamanho de fonte inválido.', 'assertive');
    }
}

// Alterna suporte a leitores de tela
export function toggleScreenReaderSupport() {
    const state = loadFromLocalStorage();
    state.settings.screenReaderSupport = !state.settings.screenReaderSupport;
    applyAccessibilitySettings(state);
    saveToLocalStorage(state);
}

// Alterna modo de depuração
export function toggleDebugMode() {
    const state = loadFromLocalStorage();
    state.settings.debugMode = !state.settings.debugMode;
    applyAccessibilitySettings(state);
    saveToLocalStorage(state);
    // Recarregar para atualizar #debug-tools
    window.location.reload();
}