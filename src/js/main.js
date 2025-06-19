async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return null;
    }
}

function displayCryptoData(data) {
    const contentList = document.querySelector('#top-currencies .content-list');
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price (USD)</th>
                <th>Change (24h)</th>
                <th>Latest News</th>
            </tr>
        </thead>
        <tbody>
            ${data.map((crypto, index) => `
                <tr data-id="${crypto.id}">
                    <td>${index + 1}</td>
                    <td class="crypto-name" data-id="${crypto.id}">${crypto.name}</td>
                    <td>${crypto.current_price} USD</td>
                    <td>${crypto.price_change_percentage_24h_in_currency.toFixed(2)}%</td>
                    <td><a href="#" class="latest-news" data-name="${crypto.name}">Latest News</a></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    contentList.innerHTML = '';
    contentList.appendChild(table);

    // Event listeners para el nombre de la criptomoneda
    document.querySelectorAll('.crypto-name').forEach(cell => {
        cell.addEventListener('click', (event) => {
            const cryptoId = event.currentTarget.getAttribute('data-id');
            const cryptoName = event.currentTarget.innerText;
            showCryptoDetails(cryptoId, cryptoName);
            console.log(`Fetching details for: ${cryptoId}, ${cryptoName}`);
        });
    });

    // Event listeners para las noticias
    document.querySelectorAll('.latest-news').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const cryptoName = event.currentTarget.getAttribute('data-name');
            showLatestNews(cryptoName);
        });
    });
}

async function fetchTrendingData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        return data.coins;
    } catch (error) {
        console.error('Error fetching trending data:', error);
        return null;
    }
}
function displayTrendingData(data) {
    const contentList = document.querySelector('#trending .content-list');
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price (BTC)</th>
                <th>Market Cap Rank</th>
                <th>Latest News</th>
            </tr>
        </thead>
        <tbody>
            ${data.map((item, index) => `
                <tr data-id="${item.item.id}">
                    <td>${index + 1}</td>
                    <td class="trending-crypto-name" data-id="${item.item.id}">${item.item.name} (${item.item.symbol.toUpperCase()})</td>
                    <td>${item.item.price_btc.toFixed(8)} BTC</td>
                    <td>${item.item.market_cap_rank}</td>
                    <td><a href="#" class="latest-news" data-name="${item.item.name}">Latest News</a></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    contentList.innerHTML = '';
    contentList.appendChild(table);

    // Añadir eventos de clic para las criptomonedas trending
    document.querySelectorAll('.trending-crypto-name').forEach(cell => {
        cell.addEventListener('click', (event) => {
            const cryptoId = event.currentTarget.getAttribute('data-id');
            const cryptoName = event.currentTarget.innerText.split(' ')[0]; // Obtener el nombre
            showCryptoDetails(cryptoId, cryptoName);
        });
    });

    // Eventos para las noticias
    document.querySelectorAll('.latest-news').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const cryptoName = event.currentTarget.getAttribute('data-name');
            showLatestNews(cryptoName);
        });
    });
}
function hideAllSections() {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        if (section.id !== 'search') {
            section.style.display = 'none';
        }
    });
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

function setupSearch(topCurrenciesData, trendingData) {
    const searchInput = document.getElementById('crypto-search');

    // Combina los datos
    const combinedData = topCurrenciesData.concat(trendingData.map(item => ({
        id: item.item.id,
        name: item.item.name,
        current_price: item.item.price_btc, // Calcula el precio en USD si es necesario
        price_change_percentage_24h_in_currency: 0 // Asigna 0 o calcula si es posible
    })));

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredData = combinedData.filter(crypto =>
            crypto.name.toLowerCase().includes(query)
        );
        displayCryptoData(filteredData);
    });
}

// Mostrar los detalles de la criptomoneda
async function showCryptoDetails(cryptoId, cryptoName) {
    const modal = document.getElementById('cryptoModal');
    const modalTitle = document.getElementById('modalTitle');
    const cryptoDetails = document.getElementById('cryptoDetails');

    modalTitle.innerText = `Details for ${cryptoName}`;

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`);
        const data = await response.json();

        console.log(data);

        const { market_data } = data;
        const { usd } = market_data.current_price || {};
        const { usd: usdMarketCap } = market_data.market_cap || {};
        const { usd: usdVolume } = market_data.total_volume || {};
        const { usd: percentageChange1h } = market_data.price_change_percentage_1h_in_currency || {};
        const { percentage_change_24h: percentageChange24h } = market_data || {};

        cryptoDetails.innerHTML = `
            <h4>${data.name} (${data.symbol.toUpperCase()})</h4>
            <p>Current Price: ${usd} USD</p>
            <p>Market Cap: ${usdMarketCap} USD</p>
            <p>24h Volume: ${usdVolume} USD</p>
            <p>1h Change: ${percentageChange1h}%</p>
            <p>24h Change: ${percentageChange24h}%</p>
        `;
    } catch (error) {
        cryptoDetails.innerHTML = `<p>Error loading data. Please try again later.</p>`;
        console.error('Error fetching data:', error);
    }

    modal.style.display = 'block';
}

// Mostrar las últimas noticias
async function showLatestNews(cryptoName) {
    const modal = document.getElementById('cryptoModal');
    const modalTitle = document.getElementById('modalTitle');
    const cryptoDetails = document.getElementById('cryptoDetails');

    modalTitle.innerText = `Latest News for ${cryptoName}`;

    try {
        const newsResponse = await fetch(`https://newsapi.org/v2/everything?q=${cryptoName}&apiKey=8acea105da364440aabd20251eb1a997`);
        const newsData = await newsResponse.json();

        const limitedNews = newsData.articles.slice(0, 5);

        cryptoDetails.innerHTML = `
            <h4>News:</h4>
            <ul>
                ${limitedNews.map(article => `<li><a href="${article.url}" target="_blank">${article.title}</a></li>`).join('')}
            </ul>
        `;
    } catch (error) {
        cryptoDetails.innerHTML = `<p>Error loading news. Please try again later.</p>`;
        console.error('Error fetching news:', error);
    }

    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();

    hideAllSections();
    showSection('#top-currencies');

    const cryptoData = await fetchCryptoData();
    const trendingData = await fetchTrendingData();

    if (cryptoData && trendingData) {
        displayCryptoData(cryptoData);
        displayTrendingData(trendingData);
        setupSearch(cryptoData, trendingData);
    }
});

// Cerrar el modal
document.querySelector('.close').onclick = function() {
    document.getElementById('cryptoModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('cryptoModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}