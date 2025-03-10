
var map = L.map('map').setView(coordinate, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
console.log(coordinate);
var marker = L.marker(coordinate).addTo(map);
marker.bindPopup("<b>Hello world!</b><br>welcome to InstaStay.").openPopup();

//reviews star rating
const stars = document.querySelectorAll('.star-rating i');
const ratingInput = document.getElementById('rating');

stars.forEach((star) => {
  star.addEventListener('pointerdown', () => {
    const rating = star.getAttribute('data-value');
    ratingInput.value = rating;

    // Clear previous selections
    stars.forEach((s) => s.classList.remove('text-warning', 'fa-solid'));

    // Highlight the selected stars
    for (let i = 0; i < rating; i++) {
      stars[i].classList.add('text-warning', 'fa-solid');
    }
  });
});

