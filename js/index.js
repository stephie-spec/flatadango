document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();

    buyTicketBtn.addEventListener('click', handleBuyTicket);
});

let currentMovie = null;
let allMovies = [];

const filmsList = document.getElementById('films');
const poster = document.getElementById('poster');
const title = document.getElementById('title');
const runtime = document.getElementById('runtime');
const description = document.getElementById('description');
const showtime = document.getElementById('showtime');
const ticketNum = document.getElementById('ticket-num');
const buyTicketBtn = document.getElementById('buy-ticket');
const movieDetails = document.getElementById('movie-details');


function fetchMovies() {
    fetch(`http://localhost:3000/films`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            return response.json();
        })
        .then(movies => {
            allMovies = movies;
            displayMovies(movies);
            if (movies.length > 0) {
                displayMovieDetails(movies[0].id);
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });
}

        function displayMovies(movies) {
            filmsList.innerHTML = '';
            
            if (movies.length === 0) {
                filmsList.innerHTML = '<li>No movies available</li>';
                return;
            }
            
            movies.forEach(movie => {
                const listItem = document.createElement('li');
                listItem.classList.add('film', 'item');
                
                if (movie.capacity - movie.tickets_sold === 0) {
                    listItem.classList.add('sold-out');
                }
                
                listItem.textContent = movie.title;
                listItem.addEventListener('click', () => displayMovieDetails(movie.id));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', (e) => {
                    deleteMovie(movie.id);
                });
                
                listItem.appendChild(deleteBtn);
                filmsList.appendChild(listItem);
            });
        }

        function displayMovieDetails(movieId) {
            movieDetails.style.display = 'block';
            poster.style.display = 'none';
            buyTicketBtn.style.display = 'none';
            
            fetch(`http://localhost:3000/films/${movieId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch movie details');
                    }
                    return response.json();
                })
                .then(movie => {
                    currentMovie = movie;
                    
                    poster.src = movie.poster;
                    poster.alt = `${movie.title} Poster`;
                    title.textContent = movie.title;
                    runtime.textContent = `${movie.runtime} minutes`;
                    description.textContent = movie.description;
                    showtime.textContent = `Showtime: ${movie.showtime}`;
                    
                    const availableTickets = movie.capacity - movie.tickets_sold;
                    ticketNum.textContent = `${availableTickets} remaining tickets`;
                    
                    if (availableTickets === 0) {
                        buyTicketBtn.textContent = 'Sold Out';
                        buyTicketBtn.disabled = true;
                    } else {
                        buyTicketBtn.textContent = 'Buy Ticket';
                        buyTicketBtn.disabled = false;
                    }
                    
                    movieDetails.style.display = 'none';
                    poster.style.display = 'block';
                    buyTicketBtn.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error fetching movie details:', error);
                    movieDetails.innerHTML = 'Error loading movie details';
                });
        }
