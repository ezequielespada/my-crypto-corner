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

    document.querySelectorAll('.crypto-name').forEach(cell => {
        cell.addEventListener('click', (event) => {
            const cryptoId = event.currentTarget.getAttribute('data-id');
            const cryptoName = event.currentTarget.innerText;
            showCryptoDetails(cryptoId, cryptoName);
            console.log(`Fetching details for: ${cryptoId}, ${cryptoName}`);
        });
    });

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

    document.querySelectorAll('.trending-crypto-name').forEach(cell => {
        cell.addEventListener('click', (event) => {
            const cryptoId = event.currentTarget.getAttribute('data-id');
            const cryptoName = event.currentTarget.innerText.split(' ')[0];
            showCryptoDetails(cryptoId, cryptoName);
        });
    });

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
    const combinedData = topCurrenciesData.concat(trendingData.map(item => ({
        id: item.item.id,
        name: item.item.name,
        current_price: item.item.price_btc,
        price_change_percentage_24h_in_currency: 0
    })));

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredData = combinedData.filter(crypto =>
            crypto.name.toLowerCase().includes(query)
        );
        displayCryptoData(filteredData);
    });
}

async function showCryptoDetails(cryptoId, cryptoName) {
    const modal = document.getElementById('cryptoModal');
    const modalTitle = document.getElementById('modalTitle');
    const cryptoDetails = document.getElementById('cryptoDetails');

    modalTitle.innerText = `Details for ${cryptoName}`;

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`);
        const data = await response.json();

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

function setupLogin() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const loginButton = document.querySelector('.login');

    function checkLoginStatus() {
        if (localStorage.getItem('loggedIn') === 'true') {
            loginButton.textContent = 'Logout';
            loginModal.style.display = 'none';
        } else {
            loginButton.textContent = 'Login';
        }
    }

    checkLoginStatus();

    loginButton.onclick = () => {
        if (localStorage.getItem('loggedIn') === 'true') {
            localStorage.removeItem('loggedIn');
            checkLoginStatus();
        } else {
            loginModal.style.display = 'block';
        }
    };

    document.querySelector('#loginModal .close').onclick = function() {
        loginModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    };

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            loginMessage.textContent = 'Login successful!';
            loginModal.style.display = 'none';
            checkLoginStatus();
        } else {
            loginMessage.textContent = 'Invalid username or password.';
        }
    });
}

function setupRegister() {
    const registerModal = document.getElementById('registerModal');
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    const registerButton = document.querySelector('.register');

    registerButton.onclick = () => {
        registerModal.style.display = 'block';
    };

    document.querySelector('#registerModal .close').onclick = function() {
        registerModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    };

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        // Guardar usuario en localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.username === newUsername)) {
            registerMessage.textContent = 'Username already exists.';
            return;
        }

        users.push({ username: newUsername, password: newPassword });
        localStorage.setItem('users', JSON.stringify(users));
        registerMessage.textContent = 'Registration successful!';
        registerModal.style.display = 'none';
    });
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

    setupLogin();
    setupRegister();
});

// Cerrar cualquier modal al hacer clic en el botón de cerrar
document.querySelectorAll('.close').forEach(button => {
    button.onclick = function() {
        button.parentElement.parentElement.style.display = 'none';
    };
});

window.onclick = function(event) {
    // Condición para cerrar el modal al hacer clic fuera
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}