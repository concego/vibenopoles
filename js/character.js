// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify, debugLog } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de personagem
export function initCharacter(state) {
    debugLog('Inicializando personagem', { state });
    state.character = state.character || { created: false };

    if (!state.character.created) {
        showCharacterCreation(state);
    } else {
        showCharacter(state);
    }

    saveToLocalStorage(state);
}

// Exibe o formulário de criação de personagem
function showCharacterCreation(state) {
    debugLog('Exibindo formulário de criação de personagem');
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para criação de personagem');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }

    const characterSection = document.createElement('section');
    characterSection.id = 'character-creation';
    characterSection.setAttribute('role', 'region');
    characterSection.setAttribute('aria-label', 'Criação de Personagem');
    characterSection.innerHTML = `
        <h2>Criação de Personagem 🧑‍🚀</h2>
        <form id="character-form" role="form" aria-label="Formulário de criação de personagem">
            <p id="form-instructions">Preencha o nome e selecione uma classe para criar seu personagem.</p>
            <label for="char-name">Nome:</label>
            <input type="text" id="char-name" aria-describedby="form-instructions" aria-label="Nome do personagem" required>
            <label for="char-class">Classe:</label>
            <select id="char-class" aria-describedby="form-instructions" aria-label="Classe do personagem" required>
                <option value="">Selecione uma classe</option>
                <option value="Farmer">Fazendeiro</option>
                <option value="Merchant">Comerciante</option>
                <option value="Explorer">Explorador</option>
            </select>
            <button type="submit" onclick="createCharacter()" aria-label="Criar personagem">Criar</button>
        </form>
    `;

    const existingSection = document.getElementById('character-creation');
    if (existingSection) {
        existingSection.replaceWith(characterSection);
        debugLog('Seção #character-creation substituída');
    } else {
        gameContainer.appendChild(characterSection);
        debugLog('Seção #character-creation adicionada ao #game');
    }

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();
}

// Exibe as informações do personagem
function showCharacter(state) {
    debugLog('Exibindo informações do personagem', { character: state.character });
    const gameContainer = document.getElementById('game');
    if (!gameContainer) {
        debugLog('Erro: Contêiner #game não encontrado para exibição de personagem');
        notify('⚠️ Erro: Contêiner do jogo não encontrado.', 'assertive');
        return;
    }

    const characterSection = document.createElement('section');
    characterSection.id = 'character';
    characterSection.setAttribute('role', 'region');
    characterSection.setAttribute('aria-label', 'Informações do Personagem');
    characterSection.innerHTML = `
        <h2>Personagem 🧑‍🚀</h2>
        <p id="character-info" aria-live="polite">
            Nome: ${state.character.name}<br>
            Classe: ${state.character.class}<br>
            Nível: ${state.character.level || 1}
        </p>
        <button onclick="resetCharacter()" aria-label="Reiniciar personagem">Reiniciar Personagem</button>
    `;

    const existingSection = document.getElementById('character');
    if (existingSection) {
        existingSection.replaceWith(characterSection);
        debugLog('Seção #character substituída');
    } else {
        gameContainer.appendChild(characterSection);
        debugLog('Seção #character adicionada ao #game');
    }

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();
}

// Função para criar o personagem
window.createCharacter = function() {
    const state = loadFromLocalStorage();
    const name = document.getElementById('char-name').value.trim();
    const charClass = document.getElementById('char-class').value;

    if (!name || !charClass) {
        debugLog('Validação falhou: Nome ou classe não preenchidos', { name, charClass });
        notify('⚠️ Preencha o nome e selecione uma classe.', 'assertive');
        return;
    }

    state.character = {
        created: true,
        name: name,
        class: charClass,
        level: 1
    };

    debugLog('Personagem criado com sucesso', { character: state.character });
    notify(`🎉 Personagem ${name} criado com sucesso!`, 'assertive');
    saveToLocalStorage(state);
    showCharacter(state);
};

// Função para reiniciar o personagem
window.resetCharacter = function() {
    const state = loadFromLocalStorage();
    debugLog('Reiniciando personagem');
    state.character = { created: false };
    notify('🔄 Personagem reiniciado.', 'assertive');
    saveToLocalStorage(state);
    showCharacterCreation(state);
};