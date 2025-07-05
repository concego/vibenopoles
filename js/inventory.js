// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de inventário
export function initInventory(state) {
    debugLog('Inicializando sistema de inventário', { state });
    state.farm = state.farm || {
        inventory: { seeds: {}, crops: {} }
    };

    updateInventory(state);
    saveToLocalStorage(state);
}

// Atualiza a interface do inventário
export function updateInventory(state) {
    debugLog('Atualizando interface do inventário', { inventory: state.farm.inventory });
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para inventário');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }

    const inventorySection = document.createElement('section');
    inventorySection.id = 'inventory';
    inventorySection.setAttribute('role', 'region');
    inventorySection.setAttribute('aria-label', 'Inventário');
    
    // Construir a lista de itens do inventário
    let inventoryHTML = '<h2>Inventário 🎒</h2>';
    inventoryHTML += '<ul id="inventory-list" aria-live="polite">';
    
    const seeds = state.farm.inventory.seeds || {};
    const crops = state.farm.inventory.crops || {};
    
    // Exibir sementes
    for (const seed in seeds) {
        if (seeds[seed] > 0) {
            inventoryHTML += `<li>${seed}: ${seeds[seed]}</li>`;
        }
    }
    
    // Exibir cultivos
    for (const crop in crops) {
        if (crops[crop] > 0) {
            inventoryHTML += `<li>${crop}: ${crops[crop]}</li>`;
        }
    }
    
    // Caso o inventário esteja vazio
    if (Object.keys(seeds).length === 0 && Object.keys(crops).length === 0) {
        inventoryHTML += '<li aria-label="Inventário vazio">Nenhum item no inventário.</li>';
    }
    
    inventoryHTML += '</ul>';
    
    inventorySection.innerHTML = inventoryHTML;

    const existingSection = document.getElementById('inventory');
    if (existingSection) {
        existingSection.replaceWith(inventorySection);
        debugLog('Seção #inventory substituída');
    } else {
        gameContainer.appendChild(inventorySection);
        debugLog('Seção #inventory adicionada ao #game');
    }

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    saveToLocalStorage(state);
}