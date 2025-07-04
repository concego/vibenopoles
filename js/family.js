// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o estado da família
export function initFamily(state) {
    // Garantir que o estado da família existe
    state.family = state.family || {
        members: [
            { name: 'Mãe', relationship: 50, status: 'Vivo', age: 40, role: 'Cuidador' },
            { name: 'Pai', relationship: 50, status: 'Vivo', age: 42, role: 'Provedor' },
            { name: 'Irmão', relationship: 30, status: 'Vivo', age: 15, role: 'Estudante' }
        ],
        homeStatus: { cleanliness: 50, comfort: 50 }
    };

    // Atualizar interface
    updateFamilyUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface da família
function updateFamilyUI(state) {
    const familySection = document.createElement('div');
    familySection.id = 'family';
    familySection.setAttribute('role', 'region');
    familySection.setAttribute('aria-label', 'Estado da Família');
    familySection.innerHTML = `
        <h2>Família</h2>
        <ul id="family-list" role="list" aria-live="polite">
            ${state.family.members.map(member => `
                <li>
                    ${member.name} (Idade: ${member.age}, Relacionamento: ${member.relationship} 💞, Status: ${member.status})
                    <button onclick="interactWithFamilyMember('${member.name}')" aria-label="Interagir com ${member.name}">Interagir</button>
                </li>
            `).join('')}
        </ul>
        <p id="home-status" aria-live="polite">
            Casa: Limpeza <span id="cleanliness">${state.family.homeStatus.cleanliness}</span> 🧹 | 
            Conforto <span id="comfort">${state.family.homeStatus.comfort}</span> 🛋️
        </p>
    `;

    // Substituir ou adicionar a seção na interface
    const existingFamilySection = document.getElementById('family');
    if (existingFamilySection) {
        existingFamilySection.replaceWith(familySection);
    } else {
        document.getElementById('game').appendChild(familySection);
    }

    // Verificar condições da casa
    checkHomeConditions(state);
}

// Verifica condições da casa (ex.: limpeza baixa)
function checkHomeConditions(state) {
    if (state.family.homeStatus.cleanliness <= 20) {
        notify('🧹 A casa está muito suja! Limpe-a.');
    }
    if (state.family.homeStatus.comfort <= 20) {
        notify('🛋️ A casa está desconfortável! Melhore o conforto.');
    }
}

// Função para interagir com um membro da família
window.interactWithFamilyMember = function(memberName) {
    const state = loadFromLocalStorage();
    const member = state.family.members.find(m => m.name === memberName);
    if (member) {
        // Aumentar relacionamento
        member.relationship = Math.min(100, member.relationship + 10);
        notify(`💞 Você interagiu com ${memberName}! Relacionamento: ${member.relationship}`);
        updateFamilyUI(state);
        saveToLocalStorage(state);
    }
};

// Função para atualizar a família (ex.: após eventos ou ações)
export function updateFamily(state, updates) {
    state.family = { ...state.family, ...updates.family };
    state.family.homeStatus = { ...state.family.homeStatus, ...updates.homeStatus };

    // Garantir limites
    state.family.members.forEach(member => {
        member.relationship = Math.max(0, Math.min(100, member.relationship));
        member.age = Math.max(0, member.age);
    });
    state.family.homeStatus.cleanliness = Math.max(0, Math.min(100, state.family.homeStatus.cleanliness));
    state.family.homeStatus.comfort = Math.max(0, Math.min(100, state.family.homeStatus.comfort));

    // Atualizar interface
    updateFamilyUI(state);

    // Salvar estado
    saveToLocalStorage(state);
}

// Função para avançar a idade dos membros da família (chamada por calendar.js)
export function ageFamily(state) {
    state.family.members.forEach(member => {
        member.age += 1;
        if (member.age >= 100) {
            member.status = 'Falecido';
            notify(`😢 ${member.name} faleceu aos ${member.age} anos.`);
        }
    });
    updateFamilyUI(state);
    saveToLocalStorage(state);
}
