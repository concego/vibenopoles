// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog, randomInt } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de agricultura
export function initFarm(state) {
    debugLog('Inicializando sistema de agricultura', { state });
    state.farm = state.farm || {
        plots: [], // Array de lotes: { crop: string, plantedDay: number, growthDays: number }
        inventory: { seeds: {}, crops: {} }
    };

    updateFarm(state);
    saveToLocalStorage(state);
}

// Atualiza o sistema de agricultura com base no calendário
export function updateFarm(state) {
    debugLog('Atualizando sistema de agricultura', { dayCount: state.calendar.dayCount });
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para fazenda');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }

    const farmSection = document.createElement('section');
    farmSection.id = 'farm';
    farmSection.setAttribute('role', 'region');
    farmSection.setAttribute('aria-label', 'Fazenda');
    farmSection.innerHTML = `
        <h2>Fazenda 🌾</h2>
        <p id="farm-info" aria-live="polite">Lotes plantados: ${state.farm.plots.length}</p>
        <button onclick="plantCrop('Wheat')" aria-label="Plantar trigo">Plantar Trigo</button>
        <button onclick="plantCrop('Corn')" aria-label="Plantar milho">Plantar Milho</button>
        <button onclick="harvestCrops()" aria-label="Colher cultivos">Colher</button>
    `;

    const existingSection = document.getElementById('farm');
    if (existingSection) {
        existingSection.replaceWith(farmSection);
        debugLog('Seção #farm substituída');
    } else {
        gameContainer.appendChild(farmSection);
        debugLog('Seção #farm adicionada ao #game');
    }

    // Atualizar estado dos cultivos
    updateCropGrowth(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    saveToLocalStorage(state);
}

// Planta um novo cultivo
window.plantCrop = function(cropType) {
    const state = loadFromLocalStorage();
    debugLog('Plantando cultivo', { cropType });

    if (!state.calendar) {
        debugLog('Erro: Calendário não inicializado');
        notify('⚠️ Erro: Calendário não inicializado.', 'assertive');
        return;
    }

    const growthDays = cropType === 'Wheat' ? 3 : 5; // Trigo: 3 dias, Milho: 5 dias
    state.farm.plots.push({
        crop: cropType,
        plantedDay: state.calendar.dayCount,
        growthDays: growthDays
    });

    state.farm.inventory.seeds[cropType] = (state.farm.inventory.seeds[cropType] || 0) - 1;
    notify(`🌱 ${cropType} plantado! Crescimento em ${growthDays} dias.`, 'assertive');
    debugLog('Cultivo plantado', { crop: cropType, plantedDay: state.calendar.dayCount, growthDays });

    updateFarm(state);
};

// Atualiza o crescimento dos cultivos
function updateCropGrowth(state) {
    debugLog('Atualizando crescimento dos cultivos', { plots: state.farm.plots });
    const currentDay = state.calendar.dayCount;

    state.farm.plots = state.farm.plots.filter(plot => {
        const daysPassed = currentDay - plot.plantedDay;
        if (daysPassed >= plot.growthDays) {
            state.farm.inventory.crops[plot.crop] = (state.farm.inventory.crops[plot.crop] || 0) + randomInt(1, 3);
            debugLog('Cultivo maduro colhido automaticamente', { crop: plot.crop, quantity: state.farm.inventory.crops[plot.crop] });
            return false; // Remove cultivo maduro
        }
        return true; // Mantém cultivo em crescimento
    });

    saveToLocalStorage(state);
}

// Colhe cultivos manualmente
window.harvestCrops = function() {
    const state = loadFromLocalStorage();
    debugLog('Colhendo cultivos manualmente', { plots: state.farm.plots });
    const currentDay = state.calendar.dayCount;
    let harvested = 0;

    state.farm.plots = state.farm.plots.filter(plot => {
        const daysPassed = currentDay - plot.plantedDay;
        if (daysPassed >= plot.growthDays) {
            state.farm.inventory.crops[plot.crop] = (state.farm.inventory.crops[plot.crop] || 0) + randomInt(1, 3);
            debugLog('Cultivo colhido', { crop: plot.crop, quantity: state.farm.inventory.crops[plot.crop] });
            harvested++;
            return false;
        }
        return true;
    });

    if (harvested > 0) {
        notify(`🌾 Colhidos ${harvested} cultivo(s)!`, 'assertive');
    } else {
        notify('⚠️ Nenhum cultivo pronto para colheita.', 'assertive');
    }

    updateFarm(state);
};