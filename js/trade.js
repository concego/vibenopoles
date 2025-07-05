// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog, randomInt } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de comércio
export function initTrade(state) {
    debugLog('Inicializando sistema de comércio', { state });
    state.trade = state.trade || {
        market: {
            'Wheat': { price: randomInt(5, 10), stock: randomInt(10, 20) },
            'Corn': { price: randomInt(8, 15), stock: randomInt(5, 15) },
            'WheatSeed': { price: randomInt(2, 5), stock: randomInt(20, 30) },
            'CornSeed': { price: randomInt(3, 7), stock: randomInt(15, 25) }
        }
    };

    updateTrade(state);
    saveToLocalStorage(state);
}

// Atualiza o sistema de comércio com base no calendário
export function updateTrade(state) {
    debugLog('Atualizando sistema de comércio', { dayCount: state.calendar.dayCount });
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para comércio');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }

    // Atualizar preços com base no dia
    if (state.calendar.dayCount % 7 === 0) {
        for (let item in state.trade.market) {
            state.trade.market[item].price = randomInt(5, 15);
            state.trade.market[item].stock = randomInt(5, 30);
        }
        debugLog('Preços e estoques do mercado atualizados', { market: state.trade.market });
    }

    const tradeSection = document.createElement('section');
    tradeSection.id = 'trade';
    tradeSection.setAttribute('role', 'region');
    tradeSection.setAttribute('aria-label', 'Mercado');
    tradeSection.innerHTML = `
        <h2>Mercado 🛒</h2>
        <p id="trade-info" aria-live="polite">
            Trigo: ${state.trade.market['Wheat'].stock} unidades, $${state.trade.market['Wheat'].price}<br>
            Milho: ${state.trade.market['Corn'].stock} unidades, $${state.trade.market['Corn'].price}<br>
            Semente de Trigo: ${state.trade.market['WheatSeed'].stock} unidades, $${state.trade.market['WheatSeed'].price}<br>
            Semente de Milho: ${state.trade.market['CornSeed'].stock} unidades, $${state.trade.market['CornSeed'].price}
        </p>
        <button onclick="buyItem('WheatSeed')" aria-label="Comprar semente de trigo">Comprar Semente de Trigo</button>
        <button onclick="buyItem('CornSeed')" aria-label="Comprar semente de milho">Comprar Semente de Milho</button>
        <button onclick="sellItem('Wheat')" aria-label="Vender trigo">Vender Trigo</button>
        <button onclick="sellItem('Corn')" aria-label="Vender milho">Vender Milho</button>
    `;

    const existingSection = document.getElementById('trade');
    if (existingSection) {
        existingSection.replaceWith(tradeSection);
        debugLog('Seção #trade substituída');
    } else {
        gameContainer.appendChild(tradeSection);
        debugLog('Seção #trade adicionada ao #game');
    }

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    saveToLocalStorage(state);
}

// Compra um item no mercado
window.buyItem = function(item) {
    const state = loadFromLocalStorage();
    debugLog('Comprando item', { item });

    if (!state.farm || !state.farm.inventory) {
        debugLog('Erro: Inventário não inicializado');
        notify('⚠️ Erro: Inventário não inicializado.', 'assertive');
        return;
    }

    const marketItem = state.trade.market[item];
    if (!marketItem || marketItem.stock <= 0) {
        debugLog('Erro: Item fora de estoque', { item });
        notify(`⚠️ ${item} fora de estoque.`, 'assertive');
        return;
    }

    state.farm.inventory.seeds[item] = (state.farm.inventory.seeds[item] || 0) + 1;
    marketItem.stock--;
    notify(`🛒 Comprou 1 ${item}!`, 'assertive');
    debugLog('Item comprado', { item, stock: marketItem.stock, inventory: state.farm.inventory.seeds });

    updateTrade(state);
};

// Vende um item no mercado
window.sellItem = function(item) {
    const state = loadFromLocalStorage();
    debugLog('Vendendo item', { item });

    if (!state.farm || !state.farm.inventory || !state.farm.inventory.crops[item]) {
        debugLog('Erro: Item não disponível no inventário', { item });
        notify(`⚠️ Você não tem ${item} para vender.`, 'assertive');
        return;
    }

    state.farm.inventory.crops[item]--;
    if (state.farm.inventory.crops[item] <= 0) {
        delete state.farm.inventory.crops[item];
    }
    state.trade.market[item].stock++;
    notify(`💰 Vendeu 1 ${item}!`, 'assertive');
    debugLog('Item vendido', { item, stock: state.trade.market[item].stock, inventory: state.farm.inventory.crops });

    updateTrade(state);
};