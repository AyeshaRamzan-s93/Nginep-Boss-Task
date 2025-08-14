

const track = document.getElementById('hotels');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

let cardsPerView = getCardsPerView();
let index = 0;
let cardWidth;

function getCardsPerView() {
  const w = window.innerWidth;
  if (w <= 768) return 1;
  if (w <= 1024) return 2;
  return 3;
}

function setCardWidth() {
  const card = track.querySelector('.hotel-card');
  cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginRight);
}

function setupSlider() {
  const items = [...track.children];
  items.forEach(item => {
    const cloneStart = item.cloneNode(true);
    const cloneEnd = item.cloneNode(true);
    track.appendChild(cloneStart);
    track.insertBefore(cloneEnd, track.firstChild);
  });

  setCardWidth();

  // Jump to first real card instantly without animation
  index = cardsPerView;
  track.style.transition = 'none';
  track.style.transform = `translateX(-${cardWidth * index}px)`;
}

function slideTo(newIndex) {
  track.style.transition = 'transform 0.6s ease';
  track.style.transform = `translateX(-${cardWidth * newIndex}px)`;
  index = newIndex;
}

function handleTransitionEnd() {
  const totalItems = track.children.length;
  if (index >= totalItems - cardsPerView) {
    index = cardsPerView;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${cardWidth * index}px)`;
  }
  if (index < cardsPerView) {
    index = totalItems - cardsPerView * 2;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${cardWidth * index}px)`;
  }
}

nextBtn.addEventListener('click', () => slideTo(index + cardsPerView));
prevBtn.addEventListener('click', () => slideTo(index - cardsPerView));
track.addEventListener('transitionend', handleTransitionEnd);

window.addEventListener('resize', () => {
  cardsPerView = getCardsPerView();
  setCardWidth();
  slideTo(index);
});

setupSlider();





const tmTrack = document.getElementById('tm-track');
const tmNext = document.getElementById('tm-next');
const tmPrev = document.getElementById('tm-prev');

let tmCards = [...tmTrack.children];

// Clone first & last card for seamless loop
const tmFirst = tmCards[0].cloneNode(true);
const tmLast = tmCards[tmCards.length - 1].cloneNode(true);
tmTrack.insertBefore(tmLast, tmTrack.firstChild);
tmTrack.appendChild(tmFirst);

// Update list after cloning
tmCards = [...tmTrack.children];

let tmIndex = 1; // Start at first real card
let tmCardWidth;
let isMoving = false; // Prevent spam clicks

function updateCardWidth() {
  tmCardWidth = tmCards[0].offsetWidth + 30; // 30px gap
}
updateCardWidth();

// Position track at starting card
function setInitialPosition() {
  tmTrack.style.transition = 'none';
  tmTrack.style.transform = `translateX(-${tmCardWidth * tmIndex}px)`;
}
setInitialPosition();
setActiveCard();

// Highlight active center card
function setActiveCard() {
  tmCards.forEach(c => c.classList.remove('active'));
  tmCards[tmIndex].classList.add('active');
}

// Move slider
function moveTmSlider(direction) {
  if (isMoving) return;
  isMoving = true;

  if (direction === 'next') tmIndex++;
  else tmIndex--;

  tmTrack.style.transition = 'transform 0.6s ease';
  tmTrack.style.transform = `translateX(-${tmCardWidth * tmIndex}px)`;
}

tmTrack.addEventListener('transitionend', () => {
  if (tmIndex === tmCards.length - 1) {
    tmIndex = 1;
    tmTrack.style.transition = 'none';
    tmTrack.style.transform = `translateX(-${tmCardWidth * tmIndex}px)`;
  }
  if (tmIndex === 0) {
    tmIndex = tmCards.length - 2;
    tmTrack.style.transition = 'none';
    tmTrack.style.transform = `translateX(-${tmCardWidth * tmIndex}px)`;
  }
  setActiveCard();
  isMoving = false;
});

tmNext.addEventListener('click', () => moveTmSlider('next'));
tmPrev.addEventListener('click', () => moveTmSlider('prev'));

// Update widths on resize
window.addEventListener('resize', () => {
  updateCardWidth();
  setInitialPosition();
});



document.getElementById("dashboardLink").addEventListener("click", (e) => {
  e.preventDefault(); 
  window.location.href = "dashboard.html";
});
