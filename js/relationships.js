// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de relacionamentos
export function initRelationships(state) {
    // Garantir que o estado dos relacionamentos existe
    state.relationships = state.relationships || {
        family: state.family?.members.reduce((acc, member) => ({
            ...acc,
            [member.name]: member.relationship || 50
        }), {}) || {}, // Consolidar relacionamentos da família
        npcs: state.npcs?.relationships || {}, // Consolidar relacionamentos com NPCs
        history: {} // Ex.: { "Mãe": [{ timestamp, action: "Interagir", change: 10 }] }
    };

    // Atualizar interface
    updateRelationshipsUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface de relacionamentos
function updateRelationshipsUI(state) {
    const relationshipsSection = document.createElement('div');
    relationshipsSection.id = 'relationships';
    relationshipsSection.setAttribute('role', 'region');
    relationshipsSection.setAttribute('aria-label', 'Relacionamentos');
    relationshipsSection.innerHTML = `
        <h2>Relacionamentos</h2>
        <h3>Família</h3>
        <ul id="family-relationships" role="list" aria-live="polite">
            ${Object.keys(state.relationships.family).map(name => `
                <li>
                    ${name}: ${state.relationships.family[name]} 💞
                    <button onclick="interactWithRelationship('${name}', 'family')" aria-label="Interagir com ${name} (Família)">Interagir</button>
                </li>
            `).join('')}
        </ul>
        <h3>NPCs</h3>
        <ul id="npc-relationships" role="list" aria-live="polite">
            ${Object.keys(state.relationships.npcs).map(name => `
                <li>
                    ${name}: ${state.relationships.npcs[name]} 🤝
                    <button onclick="interactWithRelationship('${name}', 'npcs')" aria-label="Interagir com ${name} (NPC)">Interagir</button>
                </li>
            `).join('')}
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingRelationshipsSection = document.getElementById('relationships');
    if (existingRelationshipsSection) {
        existingRelationshipsSection.replaceWith(relationshipsSection);
    } else {
        document.getElementById('game').appendChild(relationshipsSection);
    }

    // Verificar condições de relacionamento
    checkRelationshipConditions(state);
}

// Verifica condições de relacionamento (ex.: relacionamento baixo)
function checkRelationshipConditions(state) {
    Object.entries(state.relationships.family).forEach(([name, value]) => {
        if (value <= 20) {
            notify(`⚠️ Relacionamento com ${name} (Família) está baixo: ${value}. Passe mais tempo com ele!`);
        }
    });
    Object.entries(state.relationships.npcs).forEach(([name, value]) => {
        if (value <= 20) {
            notify(`⚠️ Relacionamento com ${name} (NPC) está baixo: ${value}. Interaja mais!`);
        }
    });
}

// Função para interagir com um relacionamento
window.interactWithRelationship = function(name, type) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Lar Familiar' && type === 'family') {
        notify('⚠️ Vá para o Lar Familiar para interagir com a família.');
        return;
    }
    if (state.locations.currentLocation !== state.npcs?.data.find(n => n.name === name)?.location && type === 'npcs') {
        notify(`⚠️ Vá para ${state.npcs.data.find(n => n.name === name)?.location} para interagir com ${name}.`);
        return;
    }

    // Aumentar relacionamento
    const change = state.education.skills.social / 10 + 5; // Bônus baseado na habilidade social
    state.relationships[type][name] = Math.min(100, (state.relationships[type][name] || 0) + change);

    // Registrar interação
    state.relationships.history[name] = state.relationships.history[name] || [];
    state.relationships.history[name].push({ timestamp: Date.now(), action: 'Interagir', change });

    notify(`💞 Você interagiu com ${name} (${type === 'family' ? 'Família' : 'NPC'})! Relacionamento: ${state.relationships[type][name]}`);
    updateRelationshipsUI(state);
    saveToLocalStorage(state);

    // Disparar eventos relacionados
    triggerRelationshipEvents(state, name, type);
}

// Função para disparar eventos relacionados a relacionamentos
function triggerRelationshipEvents(state, name, type) {
    const relationshipValue = state.relationships[type][name];
    if (relationshipValue >= 80 && type === 'family') {
        notify(`🎉 ${name} está muito feliz com você! Bônus de humor!`);
        state.character.mood = Math.min(100, state.character.mood + 10);
    }
    if (relationshipValue >= 80 && type === 'npcs') {
        notify(`🎉 ${name} confia em você! Oportunidade especial desbloqueada.`);
        // Futuro: integrar com missions.js ou trade.js
    }
}

// Função para atualizar relacionamentos (ex.: após eventos ou missões)
export function updateRelationships(state, updates) {
    state.relationships.family = { ...state.relationships.family, ...updates.family };
    state.relationships.npcs = { ...state.relationships.npcs, ...updates.npcs };
    state.relationships.history = { ...state.relationships.history, ...updates.history };

    // Garantir limites
    Object.keys(state.relationships.family).forEach(name => {
        state.relationships.family[name] = Math.max(0, Math.min(100, state.relationships.family[name]));
    });
    Object.keys(state.relationships.npcs).forEach(name => {
        state.relationships.npcs[name] = Math.max(0, Math.min(100, state.relationships.npcs[name]));
    });

    updateRelationshipsUI(state);
    saveToLocalStorage(state);
}
