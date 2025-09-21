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
const movieDetailsLoading = document.getElementById('movie-details-loading');
