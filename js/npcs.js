// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa os NPCs
export function initNPCs(state) {
    // Garantir que o estado dos NPCs existe
    state.npcs = state.npcs || {
        relationships: {}, // Ex.: { "Comerciante": 50, "Professor": 30 }
        interactions: {}  // Ex.: { "Comerciante": { lastInteraction: timestamp } }
    };

    // Carregar dados dos NPCs de npcs.json
    fetch(`${BASE_PATH}/data/npcs.json`)
        .then(response => response.json())
        .then(data => {
            state.npcs.data = data; // Ex.: [{ name: "Comerciante", role: "Vendedor", location: "Shopping" }, ...]
            updateNPCsUI(state);
            saveToLocalStorage(state);
        })
        .catch(error => {
            console.error('Erro ao carregar npcs.json:', error);
            notify('⚠️ Erro ao carregar NPCs. Usando dados padrão.');
            state.npcs.data = [
                { name: 'Comerciante', role: 'Vendedor', location: 'Shopping' },
                { name: 'Professor', role: 'Educador', location: 'Creche' },
                { name: 'Fazendeiro', role: 'Produtor', location: 'Fazenda' }
            ];
            updateNPCsUI(state);
            saveToLocalStorage(state);
        });

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();
}

// Atualiza a interface dos NPCs
function updateNPCsUI(state) {
    const npcsSection = document.createElement('div');
    npcsSection.id = 'npcs';
    npcsSection.setAttribute('role', 'region');
    npcsSection.setAttribute('aria-label', 'Personagens Não Jogáveis');
    npcsSection.innerHTML = `
        <h2>NPCs</h2>
        <ul id="npc-list" role="list" aria-live="polite">
            ${state.npcs.data.map(npc => `
                <li>
                    ${npc.name} (${npc.role}, ${npc.location}, Relacionamento: ${state.npcs.relationships[npc.name] || 0} 🤝)
                    <button onclick="interactWithNPC('${npc.name}')" aria-label="Interagir com ${npc.name}">Interagir</button>
                </li>
            `).join('')}
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingNPCsSection = document.getElementById('npcs');
    if (existingNPCsSection) {
        existingNPCsSection.replaceWith(npcsSection);
    } else {
        document.getElementById('game').appendChild(npcsSection);
    }
}

// Função para interagir com um NPC
window.interactWithNPC = function(npcName) {
    const state = loadFromLocalStorage();
    const npc = state.npcs.data.find(n => n.name === npcName);
    if (npc) {
        // Aumentar relacionamento
        state.npcs.relationships[npcName] = (state.npcs.relationships[npcName] || 0) + 10;
        state.npcs.relationships[npcName] = Math.min(100, state.npcs.relationships[npcName]);

        // Registrar interação
        state.npcs.interactions[npcName] = { lastInteraction: Date.now() };

        notify(`🤝 Você interagiu com ${npcName}! Relacionamento: ${state.npcs.relationships[npcName]}`);
        updateNPCsUI(state);
        saveToLocalStorage(state);

        // Disparar eventos ou missões relacionadas (ex.: comércio com Comerciante)
        triggerNPCRelatedEvents(state, npc);
    }
};

// Função para disparar eventos ou missões relacionadas a NPCs
function triggerNPCRelatedEvents(state, npc) {
    if (npc.role === 'Vendedor' && state.npcs.relationships[npc.name] >= 50) {
        notify(`🎉 ${npc.name} oferece um desconto especial no Shopping!`);
        // Futuro: integrar com trade.js para descontos
    }
    if (npc.role === 'Educador' && state.npcs.relationships[npc.name] >= 30) {
        notify(`📚 ${npc.name} sugere uma nova lição na Creche!`);
        // Futuro: integrar com education.js para lições
    }
}

// Função para atualizar NPCs (ex.: após eventos ou ações)
export function updateNPCs(state, updates) {
    state.npcs = { ...state.npcs, ...updates.npcs };
    state.npcs.relationships = { ...state.npcs.relationships, ...updates.relationships };

    // Garantir limites
    Object.keys(state.npcs.relationships).forEach(npc => {
        state.npcs.relationships[npc] = Math.max(0, Math.min(100, state.npcs.relationships[npc]));
    });

    // Atualizar interface
    updateNPCsUI(state);

    // Salvar estado
    saveToLocalStorage(state);
}
