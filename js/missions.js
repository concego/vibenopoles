// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de missões
export function initMissions(state) {
    // Garantir que o estado das missões existe
    state.missions = state.missions || {
        activeMissions: [], // Ex.: [{ id: "entrega-comerciante", npc: "Comerciante", task: "Entregar 10 Trigos", reward: { coins: 50 }, progress: 0 }]
        completedMissions: [], // Ex.: [{ id: "entrega-comerciante", completedAt: timestamp }]
        lastCheck: Date.now()
    };

    // Verificar missões disponíveis
    checkAvailableMissions(state);

    // Atualizar interface
    updateMissionsUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface de missões
function updateMissionsUI(state) {
    const missionsSection = document.createElement('div');
    missionsSection.id = 'missions';
    missionsSection.setAttribute('role', 'region');
    missionsSection.setAttribute('aria-label', 'Missões');
    missionsSection.innerHTML = `
        <h2>Missões</h2>
        <ul id="mission-list" role="list" aria-live="polite">
            ${state.missions.activeMissions.length > 0 ? 
                state.missions.activeMissions.map(mission => `
                    <li>
                        ${mission.task} (NPC: ${mission.npc}, Progresso: ${mission.progress}/${mission.goal})
                        <button onclick="progressMission('${mission.id}')" aria-label="Avançar na missão ${mission.task} para ${mission.npc}">Avançar</button>
                    </li>
                `).join('') : 
                '<li>Nenhuma missão ativa no momento.</li>'
            }
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingMissionsSection = document.getElementById('missions');
    if (existingMissionsSection) {
        existingMissionsSection.replaceWith(missionsSection);
    } else {
        document.getElementById('game').appendChild(missionsSection);
    }
}

// Verifica missões disponíveis com base em relacionamentos e localização
function checkAvailableMissions(state) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Verificar apenas uma vez por dia
    if (now - state.missions.lastCheck < oneDay) return;

    state.missions.lastCheck = now;

    // Missões baseadas em NPCs (ex.: entrega para Comerciante)
    Object.entries(state.relationships.npcs).forEach(([name, value]) => {
        if (value >= 50 && Math.random() < 0.2 && !state.missions.activeMissions.find(m => m.npc === name)) {
            const missionId = `entrega-${name.toLowerCase()}`;
            if (!state.missions.completedMissions.find(m => m.id === missionId && now - m.completedAt < 7 * oneDay)) {
                state.missions.activeMissions.push({
                    id: missionId,
                    npc: name,
                    task: `Entregar 10 Trigos para ${name}`,
                    goal: 10,
                    progress: 0,
                    reward: { coins: 50 + state.education.skills.trading * 2 }, // Bônus de habilidade de comércio
                    location: state.npcs.data.find(n => n.name === name).location
                });
                notify(`📜 Nova missão: ${state.missions.activeMissions[state.missions.activeMissions.length - 1].task}!`);
            }
        }
    });

    // Missões sazonais (ex.: colheita na Primavera)
    const seasonalMission = {
        id: `colheita-${state.calendar.season.toLowerCase()}`,
        npc: 'Fazendeiro',
        task: `Colher 5 cultivos na ${state.calendar.season}`,
        goal: 5,
        progress: 0,
        reward: { coins: 100, farmingSkill: 5 },
        location: 'Fazenda'
    };
    if (!state.missions.activeMissions.find(m => m.id === seasonalMission.id) &&
        !state.missions.completedMissions.find(m => m.id === seasonalMission.id && now - m.completedAt < 7 * oneDay)) {
        state.missions.activeMissions.push(seasonalMission);
        notify(`📜 Nova missão sazonal: ${seasonalMission.task}!`);
    }

    updateMissionsUI(state);
    saveToLocalStorage(state);
}

// Função para avançar em uma missão
window.progressMission = function(missionId) {
    const state = loadFromLocalStorage();
    const mission = state.missions.activeMissions.find(m => m.id === missionId);
    if (!mission) return;

    if (state.locations.currentLocation !== mission.location) {
        notify(`⚠️ Vá para ${mission.location} para avançar na missão ${mission.task}.`);
        return;
    }
    if (state.character.energy < 15) {
        notify('⚡ Energia insuficiente para avançar na missão.');
        return;
    }

    // Avançar progresso
    mission.progress += 1;
    state.character.energy -= 15;

    if (mission.progress >= mission.goal) {
        // Concluir missão
        applyMissionRewards(state, mission);
        state.missions.activeMissions = state.missions.activeMissions.filter(m => m.id !== missionId);
        state.missions.completedMissions.push({ id: missionId, completedAt: Date.now() });
        notify(`🎉 Missão concluída: ${mission.task}! Recompensas aplicadas.`);
    } else {
        notify(`📜 Progresso na missão ${mission.task}: ${mission.progress}/${mission.goal}`);
    }

    updateMissionsUI(state);
    saveToLocalStorage(state);
};

// Função para aplicar recompensas de missão
function applyMissionRewards(state, mission) {
    if (mission.reward.coins) {
        state.resources.coins = (state.resources.coins || 0) + mission.reward.coins;
    }
    if (mission.reward.farmingSkill) {
        state.education.skills.farming = Math.min(100, state.education.skills.farming + mission.reward.farmingSkill);
    }
    // Futuro: adicionar mais tipos de recompensas (ex.: itens, relacionamento)
}

// Função para atualizar missões (chamada por calendar.js)
export function updateMissions(state) {
    checkAvailableMissions(state);
}
