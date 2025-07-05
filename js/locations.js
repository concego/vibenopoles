// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa os locais
export function initLocations(state) {
    // Garantir que o estado dos locais existe
    state.locations = state.locations || {
        currentLocation: 'Lar Familiar',
        visited: {}, // Ex.: { "Lar Familiar": { visits: 0, lastVisit: timestamp } }
        data: [
            { name: 'Lar Familiar', icon: '🏠', activities: ['Descansar', 'Comer', 'Interagir com Família'] },
            { name: 'Shopping', icon: '🏬', activities: ['Comprar', 'Vender', 'Socializar'] },
            { name: 'Fazenda', icon: '🌾', activities: ['Plantar', 'Colher', 'Cuidar de Animais'] },
            { name: 'Parque', icon: '🌳', activities: ['Relaxar', 'Exercitar', 'Socializar'] },
            { name: 'Creche', icon: '🏫', activities: ['Estudar', 'Socializar'] }
        ]
    };

    // Atualizar interface
    updateLocationsUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface dos locais
function updateLocationsUI(state) {
    const locationList = document.getElementById('location-list');
    locationList.innerHTML = state.locations.data.map(location => `
        <li>
            <button onclick="visitLocation('${location.name}')" aria-label="Visitar ${location.name}">
                ${location.name} ${location.icon}
            </button>
            ${state.locations.currentLocation === location.name ? '(Atual)' : ''}
        </li>
    `).join('');

    // Exibir atividades disponíveis no local atual
    updateLocationActivities(state);
}

// Exibe as atividades do local atual
function updateLocationActivities(state) {
    const currentLocation = state.locations.data.find(loc => loc.name === state.locations.currentLocation);
    if (!currentLocation) return;

    let activitiesSection = document.getElementById('activities');
    if (!activitiesSection) {
        activitiesSection = document.createElement('div');
        activitiesSection.id = 'activities';
        activitiesSection.setAttribute('role', 'region');
        activitiesSection.setAttribute('aria-label', 'Atividades do Local');
        document.getElementById('locations').appendChild(activitiesSection);
    }

    activitiesSection.innerHTML = `
        <h3>Atividades em ${currentLocation.name}</h3>
        <ul id="activity-list" role="list" aria-live="polite">
            ${currentLocation.activities.map(activity => `
                <li>
                    <button onclick="performActivity('${activity}')" aria-label="Realizar ${activity} em ${currentLocation.name}">
                        ${activity}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;
}

// Função para visitar um local (já definida globalmente em main.js, mas reforçada aqui)
window.visitLocation = function(locationName) {
    const state = loadFromLocalStorage();
    const location = state.locations.data.find(loc => loc.name === locationName);
    if (location) {
        state.locations.currentLocation = locationName;
        state.locations.visited[locationName] = state.locations.visited[locationName] || { visits: 0, lastVisit: 0 };
        state.locations.visited[locationName].visits += 1;
        state.locations.visited[locationName].lastVisit = Date.now();

        notify(`Você está em: ${locationName} ${location.icon}`);
        updateLocationsUI(state);
        saveToLocalStorage(state);

        // Disparar eventos ou missões relacionadas ao local
        triggerLocationEvents(state, location);
    }
};

// Função para realizar uma atividade
window.performActivity = function(activity) {
    const state = loadFromLocalStorage();
    const location = state.locations.data.find(loc => loc.name === state.locations.currentLocation);
    if (!location) return;

    // Efeitos das atividades
    if (activity === 'Descansar') {
        state.character.energy = Math.min(100, state.character.energy + 20);
        state.character.mood = Math.min(100, state.character.mood + 10);
        notify('⚡ Você descansou e se sente revigorado!');
    } else if (activity === 'Comer') {
        state.character.hunger = Math.max(0, state.character.hunger - 20);
        state.resources.coins = Math.max(0, state.resources.coins - 5);
        notify('🍽️ Você comeu e está menos faminto!');
    } else if (activity === 'Interagir com Família') {
        // Futuro: integrar com family.js
        notify('💞 Você passou um tempo com a família!');
    } else if (activity === 'Comprar') {
        // Futuro: integrar com trade.js
        state.resources.coins = Math.max(0, state.resources.coins - 10);
        notify('🛍️ Você fez uma compra no Shopping!');
    } else if (activity === 'Plantar') {
        // Futuro: integrar com farm.js
        notify('🌱 Você plantou algo na Fazenda!');
    } else if (activity === 'Estudar') {
        // Futuro: integrar com education.js
        state.character.stamina = Math.min(100, state.character.stamina + 5);
        notify('📚 Você estudou e melhorou seu vigor!');
    }

    // Atualizar interface e salvar
    updateLocationsUI(state);
    saveToLocalStorage(state);
};

// Função para disparar eventos relacionados ao local
function triggerLocationEvents(state, location) {
    if (location.name === 'Shopping' && state.locations.visited[location.name].visits >= 5) {
        notify(`🎉 Evento especial no Shopping! Novo item disponível.`);
        // Futuro: integrar com trade.js
    }
    if (location.name === 'Fazenda' && state.locations.visited[location.name].visits >= 3) {
        notify(`🌾 Colheita pronta na Fazenda!`);
        // Futuro: integrar com farm.js
    }
}
