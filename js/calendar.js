// Define o caminho base para desenvolvimento local ou GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' ? '' : '/vibenopoles';

// Importações
import { loadFromLocalStorage, saveToLocalStorage, notify } from `${BASE_PATH}/js/utils.js`;
import { addAriaLabels, handleKeyboardNavigation } from `${BASE_PATH}/js/accessibility.js`;
import { ageCharacter } from `${BASE_PATH}/js/character.js`;
import { ageFamily } from `${BASE_PATH}/js/family.js`;

// Inicializa o calendário
export function initCalendar(state) {
    // Garantir que o estado do calendário existe
    state.calendar = state.calendar || {
        day: 1,
        week: 1,
        month: 1,
        year: 1,
        season: 'Primavera',
        weather: 'Sol',
        lastUpdate: Date.now()
    };

    // Atualizar interface
    updateCalendarUI(state);

    // Adicionar acessibilidade
    addAriaLabels();
    handleKeyboardNavigation();

    // Iniciar ciclo do calendário
    startCalendarCycle(state);

    // Salvar estado
    saveToLocalStorage(state);
}

// Atualiza a interface do calendário
function updateCalendarUI(state) {
    const calendarInfo = document.getElementById('calendar-info');
    calendarInfo.innerHTML = `
        Dia: <span id="day">${state.calendar.day}</span> | 
        Semana: <span id="week">${state.calendar.week}</span> | 
        Mês: <span id="month">${state.calendar.month}</span> | 
        Ano: <span id="year">${state.calendar.year}</span> | 
        Estação: <span id="season">${state.calendar.season}</span> ${getSeasonIcon(state.calendar.season)} | 
        Clima: <span id="weather">${state.calendar.weather}</span> ${getWeatherIcon(state.calendar.weather)}
    `;

    // Aplicar tema dia/noite
    applyDayNightTheme(state);
}

// Retorna o ícone da estação
function getSeasonIcon(season) {
    const icons = {
        'Primavera': '🌷',
        'Verão': '🌴',
        'Outono': '🍂',
        'Inverno': '❄️'
    };
    return icons[season] || '';
}

// Retorna o ícone do clima
function getWeatherIcon(weather) {
    const icons = {
        'Sol': '☀️',
        'Chuva': '🌧️',
        'Nublado': '☁️',
        'Neve': '❄️'
    };
    return icons[weather] || '';
}

// Aplica tema dia/noite
function applyDayNightTheme(state) {
    const isDay = state.calendar.hour >= 6 && state.calendar.hour < 18;
    document.body.classList.toggle('day', isDay);
    document.body.classList.toggle('night', !isDay);
}

// Inicia o ciclo do calendário (avança a cada 10 minutos reais)
function startCalendarCycle(state) {
    setInterval(() => {
        advanceCalendar(state);
    }, 600000); // 10 minutos = 600000ms
}

// Avança o calendário
function advanceCalendar(state) {
    state.calendar.day += 1;
    state.calendar.lastUpdate = Date.now();

    // Atualizar semana, mês, ano
    if (state.calendar.day > 7) {
        state.calendar.day = 1;
        state.calendar.week += 1;
    }
    if (state.calendar.week > 4) {
        state.calendar.week = 1;
        state.calendar.month += 1;
    }
    if (state.calendar.month > 12) {
        state.calendar.month = 1;
        state.calendar.year += 1;
    }

    // Atualizar estação
    state.calendar.season = getSeason(state.calendar.month);
    
    // Atualizar clima (simulação simples)
    state.calendar.weather = getRandomWeather(state.calendar.season);

    // Avançar idade do personagem e família
    if (state.calendar.day === 1 && state.calendar.month === 1) {
        ageCharacter(state);
        ageFamily(state);
    }

    // Atualizar interface
    updateCalendarUI(state);

    // Notificar mudanças
    notify(`📅 Novo dia! ${state.calendar.day}/${state.calendar.month}/${state.calendar.year}, ${state.calendar.season} ${getSeasonIcon(state.calendar.season)}`);

    // Salvar estado
    saveToLocalStorage(state);
}

// Determina a estação com base no mês
function getSeason(month) {
    if (month >= 3 && month <= 5) return 'Primavera';
    if (month >= 6 && month <= 8) return 'Verão';
    if (month >= 9 && month <= 11) return 'Outono';
    return 'Inverno';
}

// Gera clima aleatório com base na estação
function getRandomWeather(season) {
    const weatherOptions = {
        'Primavera': ['Sol', 'Chuva', 'Nublado'],
        'Verão': ['Sol', 'Nublado'],
        'Outono': ['Chuva', 'Nublado', 'Sol'],
        'Inverno': ['Neve', 'Nublado', 'Chuva']
    };
    const options = weatherOptions[season];
    return options[Math.floor(Math.random() * options.length)];
}
