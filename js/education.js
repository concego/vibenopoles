// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;

// Inicializa o sistema de educação
export function initEducation(state) {
    // Garantir que o estado da educação existe
    state.education = state.education || {
        skills: {
            farming: 0, // Habilidade de agricultura
            trading: 0, // Habilidade de comércio
            social: 0   // Habilidade social
        },
        courses: [], // Ex.: [{ name: "Agricultura Básica", level: 1, progress: 0 }]
        lastStudy: 0 // Timestamp da última sessão de estudo
    };

    // Atualizar interface
    updateEducationUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface de educação
function updateEducationUI(state) {
    const educationSection = document.createElement('div');
    educationSection.id = 'education';
    educationSection.setAttribute('role', 'region');
    educationSection.setAttribute('aria-label', 'Educação');
    educationSection.innerHTML = `
        <h2>Educação</h2>
        <p id="skills" aria-live="polite">
            Habilidades: 
            Agricultura <span id="farming-skill">${state.education.skills.farming}</span> 🌾 | 
            Comércio <span id="trading-skill">${state.education.skills.trading}</span> 💰 | 
            Social <span id="social-skill">${state.education.skills.social}</span> 🤝
        </p>
        <h3>Cursos</h3>
        <ul id="course-list" role="list" aria-live="polite">
            ${state.education.courses.length > 0 ? 
                state.education.courses.map(course => `
                    <li>
                        ${course.name} (Nível ${course.level}, Progresso: ${course.progress}%)
                        <button onclick="studyCourse('${course.name}')" aria-label="Estudar ${course.name}">Estudar</button>
                    </li>
                `).join('') : 
                '<li>Nenhum curso ativo. Visite a Creche para se inscrever.</li>'
            }
        </ul>
    `;

    // Substituir ou adicionar a seção na interface
    const existingEducationSection = document.getElementById('education');
    if (existingEducationSection) {
        existingEducationSection.replaceWith(educationSection);
    } else {
        document.getElementById('game').appendChild(educationSection);
    }
}

// Função para inscrever-se em um curso (chamada por locations.js ou npcs.js)
export function enrollInCourse(state, courseName, level = 1) {
    if (!state.education.courses.find(c => c.name === courseName)) {
        state.education.courses.push({ name: courseName, level, progress: 0 });
        notify(`📚 Inscrito no curso ${courseName} (Nível ${level})!`);
        updateEducationUI(state);
        saveToLocalStorage(state);
    } else {
        notify(`⚠️ Você já está inscrito no curso ${courseName}.`);
    }
}

// Função para estudar um curso
window.studyCourse = function(courseName) {
    const state = loadFromLocalStorage();
    const course = state.education.courses.find(c => c.name === courseName);
    if (course && state.locations.currentLocation === 'Creche') {
        // Verificar se pode estudar (1 vez por dia)
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 horas em ms
        if (now - state.education.lastStudy < oneDay) {
            notify('⏳ Você só pode estudar uma vez por dia.');
            return;
        }

        // Avançar progresso
        course.progress = Math.min(100, course.progress + 20);
        state.education.lastStudy = now;

        // Aumentar habilidade correspondente
        if (course.name.includes('Agricultura')) {
            state.education.skills.farming = Math.min(100, state.education.skills.farming + 5);
        } else if (course.name.includes('Comércio')) {
            state.education.skills.trading = Math.min(100, state.education.skills.trading + 5);
        } else if (course.name.includes('Social')) {
            state.education.skills.social = Math.min(100, state.education.skills.social + 5);
        }

        // Completar curso
        if (course.progress >= 100) {
            notify(`🎉 Curso ${course.name} concluído! Habilidade melhorada.`);
            course.level += 1;
            course.progress = 0; // Reiniciar progresso para próximo nível
        } else {
            notify(`📚 Você estudou ${course.name}! Progresso: ${course.progress}%`);
        }

        updateEducationUI(state);
        saveToLocalStorage(state);
    } else {
        notify('⚠️ Vá para a Creche para estudar.');
    }
};

// Função para atualizar habilidades (ex.: após eventos ou missões)
export function updateEducation(state, updates) {
    state.education.skills = { ...state.education.skills, ...updates.skills };
    state.education.courses = updates.courses || state.education.courses;

    // Garantir limites
    Object.keys(state.education.skills).forEach(skill => {
        state.education.skills[skill] = Math.max(0, Math.min(100, state.education.skills[skill]));
    });

    updateEducationUI(state);
    saveToLocalStorage(state);
}
