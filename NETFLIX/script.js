// --- Data & State ---
const profiles = [
    { id: 1, name: 'Angel', avatar: 'images/netflix_avatar.png' },
    { id: 2, name: 'Alex', avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' },
    { id: 3, name: 'Jordan', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/1bdc9a33850498.56ba69ac2ba5b.png' },
    { id: 4, name: 'Sam', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png' }
];

const translations = {
    es: {
        inicio: "Inicio",
        series: "Series TV",
        peliculas: "Películas",
        novedades: "Novedades populares",
        mi_lista: "Mi lista",
        idiomas: "Explorar por idiomas",
        ninos: "Niños",
        reproducir: "Reproducir",
        mas_info: "Más información",
        quien_viendo: "¿Quién está viendo ahora?",
        administrar: "Administrar perfiles",
        cerrar_sesion: "Cerrar sesión en Netflix",
        tendencias: "Tendencias ahora",
        originales: "Originales de Netflix",
        accion: "Películas de acción",
        comedia: "Series de Comedia",
        documentales: "Documentales",
        estrenos: "Películas de estreno",
        solo_netflix: "Solo en Netflix"
    },
    en: {
        inicio: "Home",
        series: "TV Shows",
        peliculas: "Movies",
        novedades: "New & Popular",
        mi_lista: "My List",
        idiomas: "Browse by Languages",
        ninos: "Kids",
        reproducir: "Play",
        mas_info: "More Info",
        quien_viendo: "Who's watching?",
        administrar: "Manage Profiles",
        cerrar_sesion: "Sign Out of Netflix",
        tendencias: "Trending Now",
        originales: "Netflix Originals",
        accion: "Action Movies",
        comedia: "Comedy Series",
        documentales: "Documentaries",
        estrenos: "New Releases",
        solo_netflix: "Only on Netflix"
    }
};

let currentLanguage = localStorage.getItem('netflix_lang') || 'es';
let currentUser = JSON.parse(localStorage.getItem('netflix_user')) || null;

// --- DOM Elements ---
const profileOverlay = document.getElementById('profile-overlay');
const profileGrid = document.getElementById('profile-grid');
const currentAvatarImg = document.getElementById('current-user-img');
const otherProfilesList = document.getElementById('other-profiles');
const logoutBtn = document.getElementById('logout-btn');
const langSelect = document.getElementById('language-select');
const navbar = document.getElementById('navbar');

// --- Initialization ---
function init() {
    setupProfileSelection();
    setupLanguage();
    setupNavbarScroll();
    setupRowScrolling();
    setupNavigation();

    if (currentUser) {
        selectUser(currentUser.id, false);
    } else {
        showProfileOverlay();
    }
}

// --- Profile Logic ---
function setupProfileSelection() {
    profileGrid.innerHTML = '';
    profiles.forEach(user => {
        const item = document.createElement('div');
        item.className = 'profile-item';
        item.innerHTML = `
            <div class="profile-avatar-wrapper">
                <img src="${user.avatar}" alt="${user.name}">
            </div>
            <span class="profile-name">${user.name}</span>
        `;
        item.onclick = () => selectUser(user.id);
        profileGrid.appendChild(item);
    });
}

function selectUser(userId, animate = true) {
    const user = profiles.find(p => p.id === userId);
    currentUser = user;
    localStorage.setItem('netflix_user', JSON.stringify(user));

    // Update UI
    currentAvatarImg.src = user.avatar;
    updateOtherProfilesDropdown(userId);
    
    if (animate) {
        profileOverlay.classList.add('hidden');
    } else {
        profileOverlay.style.display = 'none';
        profileOverlay.classList.add('hidden');
    }
}

function updateOtherProfilesDropdown(currentId) {
    otherProfilesList.innerHTML = '';
    profiles.filter(p => p.id !== currentId).forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${user.avatar}"> <span>${user.name}</span>`;
        li.onclick = () => selectUser(user.id);
        otherProfilesList.appendChild(li);
    });
}

function showProfileOverlay() {
    profileOverlay.style.display = 'flex';
    setTimeout(() => profileOverlay.classList.remove('hidden'), 10);
    localStorage.removeItem('netflix_user');
}

logoutBtn.onclick = (e) => {
    e.preventDefault();
    showProfileOverlay();
};

// --- Language Logic ---
function setupLanguage() {
    langSelect.value = currentLanguage;
    langSelect.onchange = (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('netflix_lang', currentLanguage);
        applyTranslations();
    };
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLanguage];
    
    // Navbar
    const links = document.querySelectorAll('.nav__links a');
    links[0].textContent = t.inicio;
    links[1].textContent = t.series;
    links[2].textContent = t.peliculas;
    links[3].textContent = t.novedades;
    links[4].textContent = t.mi_lista;
    links[5].textContent = t.idiomas;
    
    document.querySelector('.nav__right span').textContent = t.ninos;
    
    // Banner
    document.querySelector('.banner__button--play').lastChild.textContent = " " + t.reproducir;
    document.querySelector('.banner__button--info').lastChild.textContent = " " + t.mas_info;
    
    // Rows
    const rowTitles = document.querySelectorAll('.row__title');
    rowTitles[0].textContent = t.tendencias;
    rowTitles[1].textContent = t.originales;
    rowTitles[2].textContent = t.accion;
    rowTitles[3].textContent = t.comedia;
    rowTitles[4].textContent = t.documentales;
    if (rowTitles[5]) rowTitles[5].textContent = t.estrenos;
    if (rowTitles[6]) rowTitles[6].textContent = t.solo_netflix;
    
    // Overlay
    document.querySelector('.profile-title').textContent = t.quien_viendo;
    document.querySelector('.profile-manage-btn').textContent = t.administrar;
    document.getElementById('logout-btn').textContent = t.cerrar_sesion;
}

// --- Navigation Logic ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav__links a');
    const rows = document.querySelectorAll('.row');

    navLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const categoryText = e.target.textContent;
            
            // Highlight active link
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            const t = translations[currentLanguage];

            if (categoryText === t.series) {
                filterContent('series');
            } else if (categoryText === t.peliculas) {
                filterContent('movies');
            } else if (categoryText === t.novedades) {
                filterContent('both'); // Or special 'new' category if added
            } else if (categoryText === t.inicio) {
                filterContent('all');
            } else {
                // For other links like "Mi lista", just show all for now
                filterContent('all');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    });
}

function filterContent(category) {
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (category === 'all' || category === 'both' || rowCategory === category || rowCategory === 'both') {
            row.style.display = 'block';
            row.style.animation = 'none';
            row.offsetHeight; /* trigger reflow */
            row.style.animation = null;
        } else {
            row.style.display = 'none';
        }
    });
}

// --- Existing UI Effects ---
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('nav--black');
        } else {
            navbar.classList.remove('nav--black');
        }
    });
}

function setupRowScrolling() {
    const rowPosters = document.querySelectorAll('.row__posters');
    rowPosters.forEach(row => {
        let isDown = false;
        let scrollLeft;
        let startX;

        row.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - row.offsetLeft;
            scrollLeft = row.scrollLeft;
        });

        row.addEventListener('mouseleave', () => isDown = false);
        row.addEventListener('mouseup', () => isDown = false);

        row.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - row.offsetLeft;
            const walk = (x - startX) * 2;
            row.scrollLeft = scrollLeft - walk;
        });
    });
}

// Run!
init();
