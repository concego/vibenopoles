// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de inventário
export function initInventory(state) {
    // Garantir que o estado do inventário existe (consolidado de trade.js)
    state.trade = state.trade || {
        inventory: [], // Ex.: [{ item: "Trigo", quantity: 10, value: 5, category: "Agrícola" }]
        maxSlots: 20, // Limite de itens no inventário
        lastUpdate: Date.now()
    };

    // Atualizar interface
    updateInventoryUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface do inventário
function updateInventoryUI(state) {
    const inventorySection = document.createElement('div');
    inventorySection.id = 'inventory';
    inventorySection.setAttribute('role', 'region');
    inventorySection.setAttribute('aria-label', 'Inventário');
    inventorySection.innerHTML = `
        <h2>Inventário 🎒</h2>
        <p id="inventory-status" aria-live="polite">
            Slots usados: <span id="used-slots">${state.trade.inventory.reduce((sum, item) => sum + item.quantity, 0)}</span> / ${state.trade.maxSlots}
        </p>
        <h3>Itens</h3>
        <ul id="inventory-items" role="list" aria-live="polite">
            ${state.trade.inventory.length > 0 ? 
                state.trade.inventory.map(item => `
                    <li>
                        ${item.item}: ${item.quantity} (Valor: ${item.value} moedas, Categoria: ${item.category})
                        <button onclick="useItem('${item.item}')" aria-label="Usar ${item.item}">Usar</button>
                    </li>
                `).join('') : 
                '<li>Seu inventário está vazio.</li>'
            }
        </ul>
        <button onclick="sortInventory('name')" aria-label="Ordenar inventário por nome">Ordenar por Nome</button>
        <button onclick="sortInventory('quantity')" aria-label="Ordenar inventário por quantidade">Ordenar por Quantidade</button>
    `;

    // Substituir ou adicionar a seção na interface
    const existingInventorySection = document.getElementById('inventory');
    if (existingInventorySection) {
        existingInventorySection.replaceWith(inventorySection);
    } else {
        document.getElementById('game').appendChild(inventorySection);
    }

    // Verificar condições do inventário
    checkInventoryConditions(state);
}

// Verifica condições do inventário (ex.: limite de slots)
function checkInventoryConditions(state) {
    const usedSlots = state.trade.inventory.reduce((sum, item) => sum + item.quantity, 0);
    if (usedSlots >= state.trade.maxSlots) {
        notify('⚠️ Inventário cheio! Venda ou use itens para liberar espaço.');
    }
}

// Função para adicionar um item ao inventário
export function addItem(state, item) {
    const usedSlots = state.trade.inventory.reduce((sum, i) => sum + i.quantity, 0);
    if (usedSlots + item.quantity > state.trade.maxSlots) {
        notify(`⚠️ Não há espaço suficiente para ${item.quantity} ${item.item}!`);
        return false;
    }

    const inventoryItem = state.trade.inventory.find(i => i.item === item.item);
    if (inventoryItem) {
        inventoryItem.quantity += item.quantity;
    } else {
        state.trade.inventory.push({
            item: item.item,
            quantity: item.quantity,
            value: item.value || 5,
            category: item.category || 'Geral'
        });
    }
    state.trade.lastUpdate = Date.now();

    notify(`🎒 Adicionado ${item.quantity} ${item.item} ao inventário!`);
    updateInventoryUI(state);
    saveToLocalStorage(state);
    return true;
}

// Função para usar um item
window.useItem = function(itemName) {
    const state = loadFromLocalStorage();
    const inventoryItem = state.trade.inventory.find(i => i.item === itemName);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        notify(`⚠️ Você não tem ${itemName} para usar.`);
        return;
    }

    // Efeitos do uso do item
    if (itemName === 'Ração' && state.locations.currentLocation === 'Fazenda') {
        const animal = state.farm.animals.find(a => a.health < 100);
        if (animal) {
            animal.health = Math.min(100, animal.health + 20);
            animal.lastFed = Date.now();
            inventoryItem.quantity -= 1;
            notify(`🐔 Você usou Ração para alimentar ${animal.type}! Saúde: ${animal.health}%`);
        } else {
            notify('⚠️ Nenhum animal precisa de alimentação no momento.');
            return;
        }
    } else if (itemName === 'Sementes' && state.locations.currentLocation === 'Fazenda') {
        state.farm.crops.push({
            type: 'Trigo',
            plantedAt: Date.now(),
            growthTime: 3 * 24 * 60 * 60 * 1000,
            progress: 0
        });
        inventoryItem.quantity -= 1;
        notify(`🌱 Você plantou Sementes (Trigo)!`);
    } else {
        notify(`⚠️ Vá para o local apropriado para usar ${itemName}.`);
        return;
    }

    // Remover item se quantidade for 0
    if (inventoryItem.quantity === 0) {
        state.trade.inventory = state.trade.inventory.filter(i => i.item !== itemName);
    }

    updateInventoryUI(state);
    saveToLocalStorage(state);
};

// Função para ordenar o inventário
window.sortInventory = function(criteria) {
    const state = loadFromLocalStorage();
    if (criteria === 'name') {
        state.trade.inventory.sort((a, b) => a.item.localeCompare(b.item));
    } else if (criteria === 'quantity') {
        state.trade.inventory.sort((a, b) => b.quantity - a.quantity);
    }
    state.trade.lastUpdate = Date.now();

    notify(`🎒 Inventário ordenado por ${criteria === 'name' ? 'nome' : 'quantidade'}!`);
    updateInventoryUI(state);
    saveToLocalStorage(state);
};

// Função para atualizar o inventário (ex.: após missões ou comércio)
export function updateInventory(state, updates) {
    if (updates.inventory) {
        updates.inventory.forEach(item => addItem(state, item));
    }
    updateInventoryUI(state);
    saveToLocalStorage(state);
}
