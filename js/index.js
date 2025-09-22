document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();

    buyTicketBtn.addEventListener('click', handleBuyTicket);
});

let currentMovie = null;
let allMovies = [];

const filmsList = document.querySelector('#films');
const poster = document.querySelector('#poster');
const title = document.querySelector('#title');
const runtime = document.querySelector('#runtime');
const description = document.querySelector('#description');
const showtime = document.querySelector('#showtime');
const ticketNum = document.querySelector('#ticket-num');
const buyTicketBtn = document.querySelector('#buy-ticket');
const movieDetails = document.querySelector('.movie-details');

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
            if (movies.length > 0 && !currentMovie) {
                displayMovieDetails(movies[0].id);
            } else if (currentMovie) {
                displayMovieDetails(currentMovie.id); 
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
        
        const isSoldOut = movie.capacity - movie.tickets_sold === 0;
        
        if (isSoldOut) {
            listItem.classList.add('sold-out');
        }

        listItem.textContent = movie.title;
        listItem.addEventListener('click', () => {
            const allItems = filmsList.querySelectorAll('.film.item');
            allItems.forEach(item => item.classList.remove('active'));
            
            listItem.classList.add('active');
            
            displayMovieDetails(movie.id);
        });

        if (!isSoldOut) {
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                deleteMovie(movie.id);
            });

            listItem.appendChild(deleteBtn);
        }

        filmsList.appendChild(listItem);
    });
}


function displayMovieDetails(movieId) {
    movieDetails.style.display = 'flex';
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
            showtime.textContent = `${movie.showtime}`;

            const availableTickets = movie.capacity - movie.tickets_sold;
            ticketNum.textContent = `${availableTickets} remaining tickets`;

            if (availableTickets === 0) {
                buyTicketBtn.textContent = 'Sold Out';
                buyTicketBtn.disabled = true;
            } else {
                buyTicketBtn.textContent = 'Buy Ticket';
                buyTicketBtn.disabled = false;
            }

            poster.style.display = 'block';
            buyTicketBtn.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
        });
}

function handleBuyTicket() {
    const availableTickets = currentMovie.capacity - currentMovie.tickets_sold;
    
    if (availableTickets > 0) {
        const updatedTicketsSold = currentMovie.tickets_sold + 1;
        
        fetch(`http://localhost:3000/films/${currentMovie.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tickets_sold: updatedTicketsSold
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update tickets');
            }
            return response.json();
        })
        .then(updatedMovie => {
            currentMovie.tickets_sold = updatedTicketsSold;
            
            const movieIndex = allMovies.findIndex(m => m.id === currentMovie.id);
            if (movieIndex !== -1) {
                allMovies[movieIndex].tickets_sold = updatedTicketsSold;
            }
            
            const newAvailableTickets = currentMovie.capacity - currentMovie.tickets_sold;
            ticketNum.textContent = `${newAvailableTickets} remaining tickets`;
            
            if (newAvailableTickets === 0) {
                buyTicketBtn.textContent = 'Sold Out';
                buyTicketBtn.disabled = true;
                
                const movieItems = filmsList.querySelectorAll('.film.item');
                const listItem = Array.from(movieItems).find(item => 
                    item.textContent.includes(currentMovie.title)
                );
                if (listItem) {
                    listItem.classList.add('sold-out');
                   
                    const deleteBtn = listItem.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.remove();
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error updating ticket count:', error);
        });
    }
}

function deleteMovie(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete movie');
            }

            allMovies = allMovies.filter(movie => movie.id !== movieId);

            displayMovies(allMovies);

            if (currentMovie && currentMovie.id === movieId) {
                if (allMovies.length > 0) {
                    displayMovieDetails(allMovies[0].id);
                } else {
                    clearMovieDetails();
                }
            }
        })
        .catch(error => {
            console.error('Error deleting movie:', error);
        });
}

function clearMovieDetails() {
    currentMovie = null;
    poster.style.display = 'none';
    title.textContent = '';
    runtime.textContent = '';
    description.textContent = '';
    showtime.textContent = '';
    ticketNum.textContent = '';
    buyTicketBtn.style.display = 'none';
    movieDetails.style.display = 'block';
    movieDetails.textContent = 'No movies available';
}

