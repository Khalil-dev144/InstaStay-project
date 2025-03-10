//to toggle the sidebar
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.getElementById("toggle-sidebar");
    const closeButton = document.getElementById("close-sidebar");

    if (toggleButton) {
        toggleButton.addEventListener("pointerdown", function () {
            sidebar.classList.toggle("show");
        });
    }

    if (closeButton) {
        closeButton.addEventListener("pointerdown", function () {
            sidebar.classList.remove("show");
        });
    }
});