const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&language=pt-BR`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = `${BASE_URL}/search/movie?${API_KEY}&language=pt-BR`;

const genres = [
    { "id": 28, "name": "Ação" },
    { "id": 12, "name": "Aventura" },
    { "id": 16, "name": "Animação" },
    { "id": 35, "name": "Comédia" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentário" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Família" },
    { "id": 14, "name": "Fantasia" },
    { "id": 36, "name": "História" },
    { "id": 27, "name": "Terror" },
    { "id": 10402, "name": "Música" },
    { "id": 9648, "name": "Mistério" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Ficção científica" },
    { "id": 10770, "name": "Cinema TV" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "Guerra" },
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const movieList = document.getElementById('movie-list');

let selectedGenre = [];
const perPage = 3; // Filmes por página
let currentPage = 1;
let movies = [];

// Criar tags de gêneros
setGenre();

function setGenre() {
    tagsEl.innerHTML = '';
    genres.forEach(genre => {
        const tag = document.createElement('div');
        tag.classList.add('tag');
        tag.id = genre.id;
        tag.innerText = genre.name;
        tag.addEventListener('click', () => {
            toggleGenre(genre.id);
            currentPage = 1; // Resetar página ao filtrar
            getMovies(getMoviesUrl());
            highlightSelection();
        });
        tagsEl.append(tag);
    });
}

// Alternar seleção de gênero
function toggleGenre(genreId) {
    if (selectedGenre.includes(genreId)) {
        selectedGenre = selectedGenre.filter(id => id !== genreId);
    } else {
        selectedGenre.push(genreId);
    }
}

// Destacar gêneros selecionados
function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => tag.classList.remove('highlight'));
    clearBtn();
    selectedGenre.forEach(id => {
        const highlightedTag = document.getElementById(id);
        if (highlightedTag) highlightedTag.classList.add('highlight');
    });
}

// Botão de limpar filtros
function clearBtn() {
    let clearBtn = document.getElementById('clear');
    if (!clearBtn) {
        clearBtn = document.createElement('div');
        clearBtn.classList.add('tag', 'highlight');
        clearBtn.id = 'clear';
        clearBtn.innerText = 'Limpar';
        clearBtn.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();
            currentPage = 1; // Resetar página ao limpar filtros
            getMovies(API_URL);
        });
        tagsEl.append(clearBtn);
    } else {
        clearBtn.classList.add('highlight');
    }
}

// Obter URL de filmes
function getMoviesUrl() {
    return `${API_URL}&with_genres=${encodeURIComponent(selectedGenre.join(','))}&page=${currentPage}`;
}

// Obter filmes do TMDB
function getMovies(url) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao buscar filmes');
            return res.json();
        })
        .then(data => {
            movies = data.results; // Armazena os filmes recebidos
            if (movies.length !== 0) {
                renderMovies(currentPage); // Renderiza os filmes da página atual
                updatePagination(); // Atualiza a paginação após obter filmes
            } else {
                main.innerHTML = '<h1 class="no-results">Nenhum resultado encontrado</h1>';
            }
        })
        .catch(err => {
            console.error(err);
            main.innerHTML = '<h1 class="error">Erro ao carregar filmes. Tente novamente mais tarde.</h1>';
        });
}

// Renderizar filmes
function renderMovies(page) {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    movieList.innerHTML = ''; // Limpa a lista antes de adicionar novos filmes

    const moviesToDisplay = movies.slice(startIndex, endIndex);

    moviesToDisplay.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/500'}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="overview">${movie.overview ? movie.overview : "Sinopse não disponível"}</div>
            </div>
        `;

        // Adiciona evento para exibir a sinopse ao passar o mouse
        movieEl.addEventListener('mouseenter', () => {
            movieEl.querySelector('.overview').style.display = 'block'; // Mostra a sinopse
        });

        movieEl.addEventListener('mouseleave', () => {
            movieEl.querySelector('.overview').style.display = 'none'; // Oculta a sinopse
        });

        movieList.appendChild(movieEl);
    });
}

// Atualizar a paginação
function updatePagination() {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    // Desativa o botão "Anterior" na primeira página
    prevButton.disabled = currentPage === 1;

    // Desativa o botão "Próxima" na última página
    nextButton.disabled = currentPage >= Math.ceil(movies.length / perPage);
}

// Adicionando eventos de clique para os botões de navegação
document.getElementById('prev').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderMovies(currentPage);
        updatePagination();
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentPage < Math.ceil(movies.length / perPage)) {
        currentPage++;
        renderMovies(currentPage);
        updatePagination();
    }
});

// Buscar filmes
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim(); // Remove espaços em branco
    selectedGenre = [];
    setGenre();
    currentPage = 1; // Resetar página ao buscar
    if (searchTerm) {
        getMovies(`${searchURL}&query=${encodeURIComponent(searchTerm)}`); // Use encodeURIComponent para evitar problemas com espaços
    } else {
        getMovies(API_URL);
    }
});

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    getMovies(getMoviesUrl()); // Chama a função para carregar os filmes
    updatePagination();
});
