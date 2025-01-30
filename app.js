// This file contains the JavaScript code for the currency converter application.
// It fetches current market rates from an API daily, handles user input for currency conversion,
// and updates the displayed results dynamically.

const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
const apiUrl = `https://api.exchangerate-api.com/v4/latest/USD`; // Example API endpoint

async function fetchExchangeRates() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

function populateCurrencyDropdowns(rates) {
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'PLN', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
    const currencyOptions = popularCurrencies.map(currency => `<option value="${currency}">${currency}</option>`).join('');
    document.getElementById('from-currency').innerHTML = currencyOptions;
    document.getElementById('to-currency').innerHTML = currencyOptions;
}

function convertCurrency(amount, fromRate, toRate) {
    return (amount / fromRate) * toRate;
}

function updateConversion(rates) {
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const resultDisplay = document.getElementById('result');

    const amount = parseFloat(amountInput.value);
    const fromRate = rates[fromCurrency.value];
    const toRate = rates[toCurrency.value];

    if (!isNaN(amount) && fromRate && toRate) {
        const convertedAmount = convertCurrency(amount, fromRate, toRate);
        resultDisplay.textContent = `${amount} ${fromCurrency.value} = ${convertedAmount.toFixed(2)} ${toCurrency.value}`;
    } else {
        resultDisplay.textContent = 'Please enter a valid amount and select currencies.';
    }
}

function displayExchangeValues(rates) {
    const exchangeValuesList = document.getElementById('exchange-values');
    exchangeValuesList.innerHTML = '';

    const popularCurrencies = ['EUR', 'GBP', 'PLN', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
    popularCurrencies.forEach(currency => {
        const value = (1000 * rates[currency]).toFixed(2);
        const listItem = document.createElement('li');
        listItem.className = 'exchange-value';
        listItem.textContent = `1000 USD = ${value} ${currency}`;
        exchangeValuesList.appendChild(listItem);
    });
}

const translations = {
    en: {
        title: 'Currency Converter',
        amountPlaceholder: 'Amount',
        toText: 'to',
        convertButton: 'Convert',
        exchangeTitle: 'Value of 1000 USD in various currencies:'
    },
    pl: {
        title: 'Przelicznik Walut',
        amountPlaceholder: 'Kwota',
        toText: 'na',
        convertButton: 'Przelicz',
        exchangeTitle: 'Wartość 1000 USD w różnych walutach:'
    },
    de: {
        title: 'Währungsrechner',
        amountPlaceholder: 'Betrag',
        toText: 'zu',
        convertButton: 'Umrechnen',
        exchangeTitle: 'Wert von 1000 USD in verschiedenen Währungen:'
    },
    fr: {
        title: 'Convertisseur de devises',
        amountPlaceholder: 'Montant',
        toText: 'à',
        convertButton: 'Convertir',
        exchangeTitle: 'Valeur de 1000 USD en diverses devises:'
    },
};

function changeLanguage() {
    const languageSelect = document.getElementById('language-select');
    const selectedLanguage = languageSelect.value;
    const translation = translations[selectedLanguage];

    document.getElementById('title').textContent = translation.title;
    document.getElementById('amount').placeholder = translation.amountPlaceholder;
    document.getElementById('to-text').textContent = translation.toText;
    document.getElementById('convert-button').textContent = translation.convertButton;
    document.getElementById('exchange-title').textContent = translation.exchangeTitle;

    displayExchangeValues(rates);
}

function changeTheme() {
    const themeSelect = document.getElementById('theme-select');
    const selectedTheme = themeSelect.value;
    document.body.className = selectedTheme;
}

let rates = {};

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchExchangeRates();
    rates = data.rates;
    const date = new Date(data.time_last_updated * 1000);
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();

    populateCurrencyDropdowns(rates);
    displayExchangeValues(rates);

    const convertButton = document.getElementById('convert-button');
    convertButton.addEventListener('click', () => updateConversion(rates));

    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', changeLanguage);

    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', changeTheme);

    // Set initial theme
    document.body.className = themeSelect.value;

    document.getElementById('exchange-source').innerHTML += ` on ${dateString} at ${timeString}`;

    populateCountryDropdown();
    setInterval(updateTime, 1000);
    initializeClockFace();
    setDefaultCountry();
});

function updateChart(fromCurrency, toCurrency, rates) {
    const ctx = document.getElementById('exchange-chart').getContext('2d');
    const chartData = {
        labels: Object.keys(rates),
        datasets: [{
            label: `${fromCurrency} to ${toCurrency}`,
            data: Object.values(rates).map(rate => convertCurrency(1, rates[fromCurrency], rate)),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    };

    if (window.exchangeChart) {
        window.exchangeChart.data = chartData;
        window.exchangeChart.update();
    } else {
        window.exchangeChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function populateCountryDropdown() {
    const countryInput = document.getElementById('country-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const countries = Object.values(countriesList.countries).map(country => ({
        name: country.name,
        timezone: country.timezones[0]
    }));

    countryInput.addEventListener('input', function() {
        const value = this.value;
        autocompleteList.innerHTML = '';
        if (!value) return;

        const filteredCountries = countries.filter(country => country.name.toLowerCase().includes(value.toLowerCase()));
        filteredCountries.forEach(country => {
            const item = document.createElement('div');
            item.textContent = country.name;
            item.addEventListener('click', function() {
                countryInput.value = country.name;
                countryInput.dataset.timezone = country.timezone;
                autocompleteList.innerHTML = '';
                updateTime();
            });
            autocompleteList.appendChild(item);
        });
    });
}

function updateTime() {
    const countryInput = document.getElementById('country-input');
    const selectedTimezone = countryInput.dataset.timezone || 'Europe/Warsaw';
    const currentTimeDisplay = document.getElementById('current-time');
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');

    const now = new Date();
    const options = { timeZone: selectedTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit', year: 'numeric', month: 'long', day: 'numeric' };
    const formatter = new Intl.DateTimeFormat([], options);
    currentTimeDisplay.textContent = formatter.format(now);

    const hours = now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: selectedTimezone });
    const minutes = now.toLocaleString('en-US', { minute: 'numeric', timeZone: selectedTimezone });
    const seconds = now.toLocaleString('en-US', { second: 'numeric', timeZone: selectedTimezone });

    const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
    const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const secondsDegrees = ((seconds / 60) * 360) + 90;

    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
}

function initializeClockFace() {
    const clockFace = document.querySelector('.clock-face');
    for (let i = 1; i <= 60; i++) {
        const mark = document.createElement('div');
        mark.classList.add('mark');
        if (i % 5 === 0) {
            mark.classList.add('hour-mark');
        } else {
            mark.classList.add('minute-mark');
        }
        mark.style.transform = `rotate(${i * 6}deg)`;
        clockFace.appendChild(mark);
    }
}

function setDefaultCountry() {
    const countryInput = document.getElementById('country-input');
    countryInput.value = 'Poland';
    countryInput.dataset.timezone = 'Europe/Warsaw';
    updateTime();
}