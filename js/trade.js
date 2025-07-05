// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de comércio
export function initTrade(state) {
    // Garantir que o estado do comércio existe
    state.trade = state.trade || {
        inventory: [], // Ex.: [{ item: "Trigo", quantity: 10, value: 5 }]
        market: [
            { item: "Trigo", value: 5, stock: 20 },
            { item: "Ração", value: 10, stock: 15 },
            { item: "Sementes", value: 8, stock: 30 }
        ],
        lastTrade: 0 // Timestamp da última transação
    };

    // Atualizar interface
    updateTradeUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface de comércio
function updateTradeUI(state) {
    const tradeSection = document.createElement('div');
    tradeSection.id = 'trade';
    tradeSection.setAttribute('role', 'region');
    tradeSection.setAttribute('aria-label', 'Comércio');
    tradeSection.innerHTML = `
        <h2>Comércio 🏬</h2>
        <h3>Inventário</h3>
        <ul id="inventory-list" role="list" aria-live="polite">
            ${state.trade.inventory.length > 0 ? 
                state.trade.inventory.map(item => `
                    <li>
                        ${item.item}: ${item.quantity} (Valor: ${item.value} moedas)
                        <button onclick="sellItem('${item.item}')" aria-label="Vender ${item.item}">Vender</button>
                    </li>
                `).join('') : 
                '<li>Seu inventário está vazio.</li>'
            }
        </ul>
        <h3>Mercado</h3>
        <ul id="market-list" role="list" aria-live="polite">
            ${state.trade.market.map(item => `
                <li>
                    ${item.item}: ${item.stock} (Valor: ${item.value} moedas)
                    <button onclick="buyItem('${item.item}')" aria-label="Comprar ${item.item}">Comprar</button>
                </li>
            `).join('')}
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingTradeSection = document.getElementById('trade');
    if (existingTradeSection) {
        existingTradeSection.replaceWith(tradeSection);
    } else {
        document.getElementById('game').appendChild(tradeSection);
    }
}

// Função para comprar um item
window.buyItem = function(itemName) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Shopping') {
        notify('⚠️ Vá para o Shopping para comprar itens.');
        return;
    }
    const marketItem = state.trade.market.find(i => i.item === itemName);
    if (!marketItem || marketItem.stock <= 0) {
        notify(`⚠️ ${itemName} está fora de estoque.`);
        return;
    }
    const cost = marketItem.value * (1 - state.education.skills.trading / 100); // Desconto por habilidade
    if (state.resources.coins < cost) {
        notify(`⚠️ Você precisa de ${cost.toFixed(2)} moedas para comprar ${itemName}.`);
        return;
    }

    state.resources.coins -= cost;
    marketItem.stock -= 1;
    const inventoryItem = state.trade.inventory.find(i => i.item === itemName);
    if (inventoryItem) {
        inventoryItem.quantity += 1;
    } else {
        state.trade.inventory.push({ item: itemName, quantity: 1, value: marketItem.value });
    }
    state.trade.lastTrade = Date.now();

    notify(`🛍️ Você comprou 1 ${itemName} por ${cost.toFixed(2)} moedas!`);
    updateTradeUI(state);
    saveToLocalStorage(state);
};

// Função para vender um item
window.sellItem = function(itemName) {
    const state = loadFromLocalStorage();
    if (state.locations.currentLocation !== 'Shopping') {
        notify('⚠️ Vá para o Shopping para vender itens.');
        return;
    }
    const inventoryItem = state.trade.inventory.find(i => i.item === itemName);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        notify(`⚠️ Você não tem ${itemName} para vender.`);
        return;
    }

    const revenue = inventoryItem.value * (1 + state.education.skills.trading / 100); // Bônus por habilidade
    inventoryItem.quantity -= 1;
    state.resources.coins += revenue;
    state.trade.lastTrade = Date.now();

    // Remover item do inventário se quantidade for 0
    if (inventoryItem.quantity === 0) {
        state.trade.inventory = state.trade.inventory.filter(i => i.item !== itemName);
    }

    // Reabastecer mercado
    const marketItem = state.trade.market.find(i => i.item === itemName);
    if (marketItem) {
        marketItem.stock += 1;
    }

    notify(`💰 Você vendeu 1 ${itemName} por ${revenue.toFixed(2)} moedas!`);
    updateTradeUI(state);
    saveToLocalStorage(state);

    // Atualizar missões relacionadas (ex.: entrega de Trigo)
    checkMissionProgress(state, itemName);
};

// Função para verificar progresso de missões
function checkMissionProgress(state, itemName) {
    const mission = state.missions.activeMissions.find(m => m.task.includes(itemName));
    if (mission) {
        mission.progress += 1;
        if (mission.progress >= mission.goal) {
            // Concluir missão
            applyMissionRewards(state, mission);
            state.missions.activeMissions = state.missions.activeMissions.filter(m => m.id !== mission.id);
            state.missions.completedMissions.push({ id: mission.id, completedAt: Date.now() });
            notify(`🎉 Missão concluída: ${mission.task}! Recompensas aplicadas.`);
        } else {
            notify(`📜 Progresso na missão ${mission.task}: ${mission.progress}/${mission.goal}`);
        }
        saveToLocalStorage(state);
    }
}

// Função para aplicar recompensas de missão (reutilizada de missions.js)
function applyMissionRewards(state, mission) {
    if (mission.reward.coins) {
        state.resources.coins = (state.resources.coins || 0) + mission.reward.coins;
    }
    if (mission.reward.farmingSkill) {
        state.education.skills.farming = Math.min(100, state.education.skills.farming + mission.reward.farmingSkill);
    }
}
