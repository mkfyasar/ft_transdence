const app = document.getElementById('app');

// Sayfa içeriklerini tanımlayın
const routes = {
    '/': `
        <h1>Transcendence</h1>
        <p>Neon ışıklı dünyamıza hoş geldiniz!</p>
        <nav>
            <a href="/login">Giriş Yap</a> | 
            <a href="/register">Kayıt Ol</a> | 
            <a href="/profile">Profil</a>
        </nav>
    `,
    '/login': `
        <h1>Giriş Yap</h1>
        <form id="loginForm">
            <label for="username">Kullanıcı Adı</label>
            <input type="text" id="username" placeholder="Kullanıcı adınızı girin">
            <label for="password">Şifre</label>
            <input type="password" id="password" placeholder="Şifrenizi girin">
            <button type="submit">Giriş Yap</button>
        </form>
    `,
    '/register': `
        <h1>Kayıt Ol</h1>
        <form id="registerForm">
            <label for="username">Kullanıcı Adı</label>
            <input type="text" id="username" placeholder="Kullanıcı adınızı girin">
            <label for="password">Şifre</label>
            <input type="password" id="password" placeholder="Şifrenizi girin">
            <button type="submit">Kayıt Ol</button>
        </form>
    `,
    '/profile': `
    <h1>Profil</h1>
    <div id="profileData">
        <!-- Profil verileri buraya yüklenecek -->
    </div>
`,
    '/friends': `
        <h1>Arkadaşlar</h1>
        <form id="addFriendForm">
            <label for="friendUsername">Arkadaş Kullanıcı Adı:</label>
            <input type="text" id="friendUsername" placeholder="Kullanıcı adı">
            <button type="submit">Ekle</button>
        </form>
        <div id="friendList">
            <!-- Arkadaş listesi buraya yüklenecek -->
        </div>
    `,
};

// Global değişken olarak kullanıcı adını saklayalım
let currentUsername = '';

async function loadProfile() {
    const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'GET',
        credentials: 'include', // Çerezlerin dahil edilmesi
    });

    if (response.ok) {
        const data = await response.json();
        const profileDiv = document.getElementById('profileData');
        profileDiv.innerHTML = `
            <h2>Profil</h2>
            <p><strong>Kullanıcı Adı:</strong> ${data.username}</p>
            <p><strong>E-posta:</strong> ${data.email}</p>
            <p><strong>Kayıt Tarihi:</strong> ${new Date(data.date_joined).toLocaleDateString()}</p>
        `;
    } else {
        alert('Profil verileri yüklenemedi!');
    }
}

// URL değiştiğinde çalışacak fonksiyon
function navigate() {
    const path = window.location.pathname;
    app.innerHTML = routes[path] || '<h1>404</h1><p>Sayfa bulunamadı.</p>';

    if (path === '/login') {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', handleLogin);
    } else if (path === '/register') {
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', handleRegister);
    } else if (path === '/profile') {
        loadProfile();
    } else if (path === '/friends') {
        loadFriends();
    }
}

// Giriş formu işlemi
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        alert('Giriş başarılı!');
        window.history.pushState({}, '', '/');
        navigate();
    } else {
        alert('Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
    }
}

// Kayıt formu işlemi
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        alert('Kayıt başarılı!');
        window.history.pushState({}, '', '/login');
        navigate();
    } else {
        alert('Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.');
    }
}

async function addFriend(event) {
    event.preventDefault();
    const friendUsername = document.getElementById('friendUsername').value;

    const response = await fetch('http://127.0.0.1:8000/api/add_friend/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_username: friendUsername }),
    });

    if (response.ok) {
        alert('Arkadaş başarıyla eklendi!');
        document.getElementById('friendUsername').value = '';
    } else {
        alert('Arkadaş eklenirken bir hata oluştu.');
    }
}

async function loadFriends() {
    const response = await fetch('http://127.0.0.1:8000/api/list_friends/');
    if (response.ok) {
        const data = await response.json();
        const friendListDiv = document.getElementById('friendList');
        friendListDiv.innerHTML = data.friends
            .map(f => `<p>${f.username} (Eklendi: ${new Date(f.date_added).toLocaleDateString()})</p>`)
            .join('');
    } else {
        alert('Arkadaş listesi yüklenemedi.');
    }
}


document.addEventListener('submit', (e) => {
    if (e.target.id === 'addFriendForm') {
        addFriend(e);
    }
});

// Linklere tıklama olaylarını yakala
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        window.history.pushState({}, '', href);
        navigate();
    }
});

// Geri/ileri butonları için
window.addEventListener('popstate', navigate);

// İlk yükleme
navigate();

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Modal dışına tıklandığında kapatma
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// CSRF token'ı al ve sakla
async function fetchCsrfToken() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/csrf/', {
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            return data.csrfToken;
        }
    } catch (error) {
        console.error('CSRF token alınamadı:', error);
    }
    return null;
}

// Sayfa yüklendiğinde CSRF token'ı al
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCsrfToken();
});

// Form submit işleyicisini güncelle
document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formType = e.target.closest('.modal').id === 'loginModal' ? 'login' : 'register';
        
        // Form verilerini topla
        const formData = {
            username: e.target.querySelector('input[type="text"]').value,
            password: e.target.querySelector('input[type="password"]').value
        };

        console.log('Gönderilen veriler:', formData); // Debug için

        try {
            const csrftoken = await fetchCsrfToken();
            
            const response = await fetch(`http://127.0.0.1:8000/api/${formType}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Sunucu yanıtı:', data); // Debug için

            if (response.ok) {
                showNotification('success', formType === 'login' ? 'Giriş başarılı!' : 'Kayıt başarılı!');
                closeModal(formType === 'login' ? 'loginModal' : 'registerModal');
                
                if (formType === 'login') {
                    showGameMenu(data.username);
                }
            } else {
                showNotification('error', data.message || 'Bir hata oluştu!');
            }
        } catch (error) {
            showNotification('error', 'Sunucu bağlantısında hata oluştu!');
            console.error('Error:', error);
        }
    });
});

// OAuth butonları için işleyiciler
document.querySelectorAll('.oauth-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const provider = e.target.closest('button').classList.contains('google') ? 'google' : 'github';
        window.location.href = `http://localhost:8000/api/auth/${provider}/`;
    });
});

// Çıkış yapma işlemi
async function handleLogout() {
    try {
        const csrftoken = await fetchCsrfToken(); // CSRF token'ı al
        
        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include'
        });

        if (response.ok) {
            showNotification('success', 'Çıkış yapıldı!');
            
            // Giriş/Kayıt butonlarını tekrar göster
            document.querySelector('.nav-buttons').innerHTML = `
                <button class="button" onclick="showModal('loginModal')">
                    <i class="fas fa-sign-in-alt"></i> Giriş Yap
                </button>
                <button class="button secondary" onclick="showModal('registerModal')">
                    <i class="fas fa-user-plus"></i> Kayıt Ol
                </button>
            `;

            // Ana sayfaya dön
            document.querySelector('#app').innerHTML = `
                <div class="grid">
                    <div class="card">
                        <div class="card-icon"><i class="fas fa-gamepad"></i></div>
                        <h2>Pong Oyunu</h2>
                        <p>Arkadaşlarınızla çevrimiçi Pong oynayın!</p>
                        <button class="button">Oyuna Başla</button>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon"><i class="fas fa-trophy"></i></div>
                        <h2>Sıralama</h2>
                        <p>En iyi oyuncuları görün</p>
                        <button class="button">Sıralamayı Gör</button>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon"><i class="fas fa-user-circle"></i></div>
                        <h2>Profil</h2>
                        <p>Profilinizi özelleştirin</p>
                        <button class="button">Profile Git</button>
                    </div>
                </div>
            `;
        } else {
            const data = await response.json();
            showNotification('error', data.message || 'Çıkış yapılırken bir hata oluştu');
        }
    } catch (error) {
        showNotification('error', 'Çıkış yapılırken hata oluştu!');
        console.error('Error:', error);
    }
}

// Yardımcı fonksiyonlar
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Bildirim sistemi
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Login başarılı olduğunda çağrılacak fonksiyon
function showGameMenu(username) {
    currentUsername = username; // Kullanıcı adını sakla
    document.querySelector('.nav-buttons').innerHTML = `
        <span class="welcome-text">Hoş geldin, ${username}</span>
        <button class="button" onclick="handleLogout()">Çıkış Yap</button>
    `;

    // Ana içeriği güncelle
    document.querySelector('#app').innerHTML = `
        <div class="game-menu">
            <div class="profile-section">
                <div class="profile-card">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h2>${username}</h2>
                    <div class="stats">
                        <div class="stat-item">
                            <i class="fas fa-trophy"></i>
                            <span>Skor: 1200</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-gamepad"></i>
                            <span>Oyunlar: 25</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-medal"></i>
                            <span>Zaferler: 15</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="game-options">
                <div class="game-card">
                    <div class="card-icon"><i class="fas fa-play-circle"></i></div>
                    <h3>Hızlı Oyun</h3>
                    <p>Rastgele bir rakiple eşleş</p>
                    <button class="button" onclick="startQuickGame()">Başla</button>
                </div>

                <div class="game-card">
                    <div class="card-icon"><i class="fas fa-users"></i></div>
                    <h3>Arkadaşla Oyna</h3>
                    <p>Arkadaşını davet et</p>
                    <button class="button" onclick="showFriendsList()">Davet Et</button>
                </div>

                <div class="game-card">
                    <div class="card-icon"><i class="fas fa-dumbbell"></i></div>
                    <h3>Antrenman</h3>
                    <p>Yapay zekaya karşı oyna</p>
                    <button class="button" onclick="startTraining()">Başla</button>
                </div>
            </div>

            <div class="leaderboard-section">
                <h2><i class="fas fa-crown"></i> En İyi Oyuncular</h2>
                <div class="leaderboard">
                    <div class="leaderboard-item">
                        <span class="rank">1</span>
                        <span class="player">PlayerOne</span>
                        <span class="score">1500</span>
                    </div>
                    <div class="leaderboard-item">
                        <span class="rank">2</span>
                        <span class="player">PlayerTwo</span>
                        <span class="score">1400</span>
                    </div>
                    <div class="leaderboard-item">
                        <span class="rank">3</span>
                        <span class="player">PlayerThree</span>
                        <span class="score">1300</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Oyun başlatma fonksiyonu
function startQuickGame() {
    showNotification('info', 'Oyun başlatılıyor...');
    
    // Zorluk seçimi modalı
    document.querySelector('#app').innerHTML = `
        <div class="difficulty-select">
            <h2>Zorluk Seviyesi Seçin</h2>
            <div class="difficulty-buttons">
                <button class="button" onclick="startGameWithDifficulty('easy')">Kolay</button>
                <button class="button" onclick="startGameWithDifficulty('normal')">Normal</button>
                <button class="button" onclick="startGameWithDifficulty('hard')">Zor</button>
            </div>
        </div>
    `;
}

function startGameWithDifficulty(difficulty) {
    document.querySelector('#app').innerHTML = `
        <div class="game-container">
            <canvas id="pongCanvas" width="800" height="400"></canvas>
            <div class="game-controls">
                <button class="button" onclick="exitGame()">Oyundan Çık</button>
                <div class="game-info">
                    <p>Güç-uplar:</p>
                    <span class="power-up-info green">🟢 Büyük Raket</span>
                    <span class="power-up-info red">🔴 Hızlı Top</span>
                    <span class="power-up-info blue">🔵 Yavaş Rakip</span>
                </div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('pongCanvas');
    const game = new PongGame(canvas, true, difficulty);
    game.start();
    window.currentGame = game;
}

// Oyundan çıkış
function exitGame() {
    if (window.currentGame) {
        window.currentGame.stop();
        window.currentGame = null;
    }
    if (currentUsername) {
        showGameMenu(currentUsername);
    } else {
        // Eğer username yoksa ana menüye dön
        document.querySelector('#app').innerHTML = `
            <div class="grid">
                <!-- ... ana menü HTML'i ... -->
            </div>
        `;
    }
}

function showFriendsList() {
    showNotification('info', 'Arkadaş listesi yükleniyor...');
    // Arkadaş listesi modalı gösterilecek
}

function startTraining() {
    showNotification('info', 'Antrenman modu başlatılıyor...');
    // AI karşı oyun başlatılacak
}
