// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de eventos
export function initEvents(state) {
    // Garantir que o estado dos eventos existe
    state.events = state.events || {
        activeEvents: [], // Ex.: [{ id: "festival-primavera", type: "seasonal", location: "Parque", startTime: timestamp }]
        history: [], // Ex.: [{ id: "festival-primavera", completed: timestamp }]
        lastCheck: Date.now()
    };

    // Verificar eventos disponíveis
    checkAvailableEvents(state);

    // Atualizar interface
    updateEventsUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface de eventos
function updateEventsUI(state) {
    const eventsSection = document.createElement('div');
    eventsSection.id = 'events';
    eventsSection.setAttribute('role', 'region');
    eventsSection.setAttribute('aria-label', 'Eventos');
    eventsSection.innerHTML = `
        <h2>Eventos</h2>
        <ul id="event-list" role="list" aria-live="polite">
            ${state.events.activeEvents.length > 0 ? 
                state.events.activeEvents.map(event => `
                    <li>
                        ${event.name} (${event.type}, em ${event.location})
                        <button onclick="participateEvent('${event.id}')" aria-label="Participar do evento ${event.name} em ${event.location}">Participar</button>
                    </li>
                `).join('') : 
                '<li>Nenhum evento ativo no momento.</li>'
            }
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingEventsSection = document.getElementById('events');
    if (existingEventsSection) {
        existingEventsSection.replaceWith(eventsSection);
    } else {
        document.getElementById('game').appendChild(eventsSection);
    }
}

// Verifica eventos disponíveis com base no calendário e localização
function checkAvailableEvents(state) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Verificar apenas uma vez por dia
    if (now - state.events.lastCheck < oneDay) return;

    state.events.lastCheck = now;

    // Eventos sazonais (ex.: Festival da Primavera)
    const seasonalEvents = {
        'Primavera': { id: 'festival-primavera', name: 'Festival da Primavera', type: 'seasonal', location: 'Parque' },
        'Verão': { id: 'festival-verao', name: 'Festival de Verão', type: 'seasonal', location: 'Parque' },
        'Outono': { id: 'feira-outono', name: 'Feira de Outono', type: 'seasonal', location: 'Fazenda' },
        'Inverno': { id: 'festa-inverno', name: 'Festa de Inverno', type: 'seasonal', location: 'Parque' }
    };

    const currentSeason = state.calendar.season;
    const seasonalEvent = seasonalEvents[currentSeason];

    // Adicionar evento sazonal se não estiver ativo e não foi concluído recentemente
    if (seasonalEvent && !state.events.activeEvents.find(e => e.id === seasonalEvent.id) &&
        !state.events.history.find(e => e.id === seasonalEvent.id && now - e.completed < 7 * oneDay)) {
        state.events.activeEvents.push({
            ...seasonalEvent,
            startTime: now
        });
        notify(`🎉 Novo evento disponível: ${seasonalEvent.name} em ${seasonalEvent.location}!`);
    }

    // Eventos baseados em relacionamentos (ex.: convite de NPC)
    Object.entries(state.relationships.npcs).forEach(([name, value]) => {
        if (value >= 80 && Math.random() < 0.1 && !state.events.activeEvents.find(e => e.id === `convite-${name}`)) {
            const npc = state.npcs.data.find(n => n.name === name);
            state.events.activeEvents.push({
                id: `convite-${name}`,
                name: `Convite de ${name}`,
                type: 'social',
                location: npc.location,
                startTime: now
            });
            notify(`🤝 ${name} convidou você para um evento em ${npc.location}!`);
        }
    });

    updateEventsUI(state);
    saveToLocalStorage(state);
}

// Função para participar de um evento
window.participateEvent = function(eventId) {
    const state = loadFromLocalStorage();
    const event = state.events.activeEvents.find(e => e.id === eventId);
    if (!event) return;

    if (state.locations.currentLocation !== event.location) {
        notify(`⚠️ Vá para ${event.location} para participar do evento ${event.name}.`);
        return;
    }
    if (state.character.energy < 20) {
        notify('⚡ Energia insuficiente para participar do evento.');
        return;
    }

    // Efeitos do evento
    state.character.energy -= 20;
    state.character.mood = Math.min(100, state.character.mood + 15);
    if (event.type === 'seasonal') {
        state.resources.coins += 50; // Recompensa por evento sazonal
        notify(`🎉 Você participou do ${event.name}! Ganhou 50 moedas e +15 de humor!`);
    } else if (event.type === 'social') {
        const npcName = event.name.split('Convite de ')[1];
        state.relationships.npcs[npcName] = Math.min(100, state.relationships.npcs[npcName] + 10);
        notify(`🤝 Você participou do ${event.name}! Relacionamento com ${npcName} +10!`);
    }

    // Marcar evento como concluído
    state.events.activeEvents = state.events.activeEvents.filter(e => e.id !== eventId);
    state.events.history.push({ id: eventId, completed: Date.now() });

    updateEventsUI(state);
    saveToLocalStorage(state);
};

// Função para atualizar eventos (chamada por calendar.js)
export function updateEvents(state) {
    checkAvailableEvents(state);
}
