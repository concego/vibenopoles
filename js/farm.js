// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de agricultura
export function initFarm(state) {
    // Garantir que o estado da fazenda existe
    state.farm = state.farm || {
        crops: [], // Ex.: [{ type: "Trigo", plantedAt: timestamp, growthTime: 3, progress: 0 }]
        animals: [], // Ex.: [{ type: "Galinha", health: 100, lastFed: timestamp }]
        tools: { hoe: 1, wateringCan: 1 }, // Nível das ferramentas
        lastUpdate: Date.now()
    };

    // Atualizar interface
    updateFarmUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface da fazenda
function updateFarmUI(state) {
    const farmSection = document.createElement('div');
    farmSection.id = 'farm';
    farmSection.setAttribute('role', 'region');
    farmSection.setAttribute('aria-label', 'Fazenda');
    farmSection.innerHTML = `
        <h2>Fazenda 🌾</h2>
        <h3>Plantas</h3>
        <ul id="crop-list" role="list" aria-live="polite">
            ${state.farm.crops.length > 0 ? 
                state.farm.crops.map(crop => `
                    <li>
                        ${crop.type} (Progresso: ${crop.progress}%)
                        <button onclick="harvestCrop('${crop.type}')" aria-label="Colher ${crop.type}" ${crop.progress < 100 ? 'disabled' : ''}>Colher</button>
                    </li>
                `).join('') : 
                '<li>Nenhuma planta no momento. Plante algo!</li>'
            }
        </ul>
        <h3>Animais</h3>
        <ul id="animal-list" role="list" aria-live="polite">
            ${state.farm.animals.length > 0 ? 
                state.farm.animals.map(animal => `
                    <li>
                        ${animal.type} (Saúde: ${animal.health}%)
                        <button onclick="feedAnimal('${animal.type}')" aria-label="Alimentar ${animal.type}">Alimentar</button>
                    </li>
                `).join('') : 
                '<li>Nenhum animal no momento. Adquira um!</li>'
            }
        </ul>
        <h3>Ferramentas</h3>
        <p id="tools" aria-live="polite">
            Regador: Nível <span id="watering-can">${state.farm.tools.wateringCan}</span> 💧 | 
            Enxada: Nível <span id="hoe">${state.farm.tools.hoe}</span> 🛠️
        </p>
        <button onclick="plantCrop('Trigo')" aria-label="Plantar Trigo">Plantar Trigo</button>
        <button onclick="buyAnimal('Galinha')" aria-label="Comprar Galinha">Comprar Galinha</button>
    `;

    // Substituir ou adicionar a seção na interface
    const existingFarmSection = document.getElementById('farm');
    if (existingFarmSection) {
        existingFarmSection.replaceWith(farmSection);
    } else {
        document.getElementById('game').appendChild(farmSection);
    }

    // Verificar condições da fazenda
    checkFarmConditions(state);
}

// Verifica condições da fazenda (ex.: plantas prontas, animais famintos)
function checkFarmConditions(state) {
    state.farm.crops.forEach(crop => {
        if (crop.progress >= 100) {
            notify(`🌾 ${crop.type} está pronto para colheita!`);
        }
    });
    state.farm.animals.forEach(animal => {
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - animal.lastFed > oneDay) {
            notify(`🐔 ${animal.type} está com fome! Alimente-o.`);
        }
    });
}

// Função para plantar uma cultura
window.plantCrop = function(cropType) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Fazenda') {
        notify('⚠️ Vá para a Fazenda para plantar.');
        return;
    }
    if (state.resources.coins < 10) {
        notify('⚠️ Você precisa de 10 moedas para plantar.');
        return;
    }

    state.farm.crops.push({
        type: cropType,
        plantedAt: Date.now(),
        growthTime: 3 * 24 * 60 * 60 * 1000, // 3 dias em ms
        progress: 0
    });
    state.resources.coins -= 10;

    notify(`🌱 Você plantou ${cropType}!`);
    updateFarmUI(state);
    saveToLocalStorage(state);
};

// Função para colher uma cultura
window.harvestCrop = function(cropType) {
    const state = loadFromLocalStorage();
    const crop = state.farm.crops.find(c => c.type === cropType && c.progress >= 100);
    if (crop && state.locations.currentLocation === 'Fazenda') {
        state.farm.crops = state.farm.crops.filter(c => c !== crop);
        const yield = 10 + state.education.skills.farming / 5; // Bônus da habilidade
        state.resources.coins += yield;
        notify(`🌾 Você colheu ${cropType} e ganhou ${yield} moedas!`);
        updateFarmUI(state);
        saveToLocalStorage(state);
    } else {
        notify('⚠️ Vá para a Fazenda para colher ou espere a planta crescer.');
    }
};

// Função para comprar um animal
window.buyAnimal = function(animalType) {
    const state = loadFromLocalStorage();
    if (state.resources.coins < 50) {
        notify('⚠️ Você precisa de 50 moedas para comprar um animal.');
        return;
    }
    if (state.locations.currentLocation !== 'Fazenda') {
        notify('⚠️ Vá para a Fazenda para comprar um animal.');
        return;
    }

    state.farm.animals.push({
        type: animalType,
        health: 100,
        lastFed: Date.now()
    });
    state.resources.coins -= 50;

    notify(`🐔 Você comprou uma ${animalType}!`);
    updateFarmUI(state);
    saveToLocalStorage(state);
};

// Função para alimentar um animal
window.feedAnimal = function(animalType) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Fazenda') {
        notify('⚠️ Vá para a Fazenda para alimentar animais.');
        return;
    }
    if (state.resources.coins < 5) {
        notify('⚠️ Você precisa de 5 moedas para comprar ração.');
        return;
    }

    const animal = state.farm.animals.find(a => a.type === animalType);
    if (animal) {
        animal.health = Math.min(100, animal.health + 20);
        animal.lastFed = Date.now();
        state.resources.coins -= 5;
        notify(`🐔 Você alimentou a ${animalType}! Saúde: ${animal.health}%`);
        updateFarmUI(state);
        saveToLocalStorage(state);
    }
};

// Função para atualizar o progresso da fazenda (chamada por calendar.js)
export function updateFarmProgress(state) {
    const now = Date.now();
    state.farm.crops.forEach(crop => {
        const elapsed = now - crop.plantedAt;
        crop.progress = Math.min(100, (elapsed / crop.growthTime) * 100);
    });
    state.farm.animals.forEach(animal => {
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - animal.lastFed > oneDay) {
            animal.health = Math.max(0, animal.health - 10);
        }
    });
    checkFarmConditions(state);
    updateFarmUI(state);
    saveToLocalStorage(state);
}
