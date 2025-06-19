// api.js - funciones relacionadas con la API
export async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data); // Verificar datos en la consola
        return data;
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return null;
    }
}

function displayCryptoData(data) {
    const list = document.querySelector('#top-currencies .content-list');
    list.innerHTML = '';  // Limpiar la lista antes de agregar nuevos elementos

    data.forEach((crypto) => {
        const listItem = document.createElement('div');
        listItem.textContent = `${crypto.name}: ${crypto.current_price} USD`;  // Mostrar nombre y precio
        list.appendChild(listItem);
    });
}

// ui.js - visibilidad y el contenido de las secciones
function hideAllSections() {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => section.style.display = 'none');
}

function showSection(id) {
    const section = document.querySelector(id);
    if (section) {
        section.style.display = 'block';
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-bar a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            hideAllSections();
            const target = event.target.getAttribute('href');
            showSection(target);
        });
    });
}

// main.js
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();

    // Mostrar "Top Currencies" por defecto
    hideAllSections();
    showSection('#top-currencies');

    // Obtener y mostrar datos al cargar
    const cryptoData = await fetchCryptoData();
    if (cryptoData) {
        displayCryptoData(cryptoData);
    }
});