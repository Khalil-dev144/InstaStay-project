
var map = L.map('map').setView(coordinate, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
console.log(coordinate);
var marker = L.marker(coordinate).addTo(map);
marker.bindPopup("<b>Hello world!</b><br>welcome to InstaStay.").openPopup();