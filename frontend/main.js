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
