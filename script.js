const body = document.body;
const form = document.getElementById('bmi-form');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const resultBox = document.getElementById('result');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const translatable = document.querySelectorAll('[data-ru][data-en]');
let lastResultState = null;

const translations = {
    ru: {
        errorInvalid: 'Пожалуйста, введите корректный вес и рост.',
        result: (value, category) => `Ваш ИМТ: ${value} — ${category}`,
        categories: [
            'Недостаточная масса тела',
            'Норма',
            'Избыточная масса тела',
            'Ожирение'
        ]
    },
    en: {
        errorInvalid: 'Please enter valid weight and height.',
        result: (value, category) => `Your BMI: ${value} — ${category}`,
        categories: [
            'Underweight',
            'Normal weight',
            'Overweight',
            'Obesity'
        ]
    }
};

function getLanguage() {
    return body.dataset.language || 'en';
}

function getTheme() {
    return body.dataset.theme || 'light';
}

function applyTranslations() {
    const lang = getLanguage();

    translatable.forEach(element => {
        element.textContent = element.dataset[lang];
    });

    themeToggle.ariaLabel = themeToggle.dataset[`${lang}Label`];
    langToggle.ariaLabel = langToggle.dataset[`${lang}Label`];
    document.documentElement.lang = lang;
    updateThemeButton();
    updateLangButton();
    rerenderResult();
}

function rerenderResult() {
    if (!lastResultState) return;

    if (lastResultState.type === 'result') {
        const category = translations[getLanguage()].categories[lastResultState.categoryIndex];
        showResult(translations[getLanguage()].result(lastResultState.value, category), false, false);
    } else if (lastResultState.type === 'error') {
        showResult(translations[getLanguage()].errorInvalid, true, false);
    }
}

function updateThemeButton() {
    themeToggle.textContent = getTheme() === 'light' ? '🌙' : '☀️';
}

function updateLangButton() {
    langToggle.textContent = getLanguage() === 'ru' ? '🇺🇸' : '🇷🇺';
}

function setTheme(theme) {
    body.dataset.theme = theme;
    updateThemeButton();
}

function setLanguage(lang) {
    body.dataset.language = lang;
    applyTranslations();
}

function formatCategory(bmi) {
    const lang = getLanguage();
    const [underweight, normal, overweight, obesity] = translations[lang].categories;

    if (bmi < 18.5) return underweight;
    if (bmi < 25) return normal;
    if (bmi < 30) return overweight;
    return obesity;
}

function showResult(message, isError = false, saveState = true) {
    resultBox.textContent = message;
    resultBox.style.color = isError ? '#b91c1c' : '#475569';
    if (!saveState) return;

    if (isError) {
        lastResultState = { type: 'error' };
    } else {
        // result state should be saved by caller when needed
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();

    const weight = parseFloat(weightInput.value.replace(',', '.'));
    const height = parseFloat(heightInput.value.replace(',', '.'));

    if (!weight || !height || weight <= 0 || height <= 0) {
        lastResultState = { type: 'error' };
        showResult(translations[getLanguage()].errorInvalid, true, false);
        return;
    }

    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    const rounded = bmi.toFixed(1);
    const category = formatCategory(bmi);
    const categoryIndex = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;

    lastResultState = { type: 'result', value: rounded, categoryIndex };
    showResult(translations[getLanguage()].result(rounded, category), false, false);
});

themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
});

langToggle.addEventListener('click', () => {
    setLanguage(getLanguage() === 'ru' ? 'en' : 'ru');
});

applyTranslations();
