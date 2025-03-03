document.getElementById("searchBtn").addEventListener("pointerdown", async () => {
    const priceInput = document.getElementById("priceInput").value.trim();
    const locationInput = document.getElementById("locationInput").value.trim();
    const roomList = document.getElementById("roomList");

    // Show loading indicator
    roomList.innerHTML = `<h4 class="text-center text-primary">Searching...</h4>`;

    // Validate input
    if (!priceInput) {
        roomList.innerHTML = `<h4 class="text-center text-danger">Please enter a valid price.</h4>`;
        return;
    }

    const price = parseInt(priceInput);
    if (isNaN(price)) {
        roomList.innerHTML = `<h4 class="text-center text-danger">Invalid price format.</h4>`;
        return;
    }

    // Prepare request body (only include location if it exists)
    const requestBody = locationInput ? { price, location: locationInput } : { price };
    try {
        const response = await fetch("https://insta-stay-project.vercel.app/listings/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const rooms = await response.json();
        displayRooms(rooms);
    } catch (error) {
        console.error("Fetch error:", error);
        roomList.innerHTML = `<h4 class="text-center text-danger">Failed to load rooms. Please try again later.</h4>`;
    }
});

function displayRooms(rooms) {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    if (!rooms || rooms.length === 0) {
        roomList.innerHTML = `<h4 class="text-center text-danger">🚫 No Rooms Found</h4>`;
        return;
    }

    // Generate room cards dynamically
    roomList.innerHTML = rooms.map(room =>`
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card shadow-lg">
                <img src="${room.image.url}" class="card-img-top room-img" alt="Room Image">
                <div class="card-body">
                    <h5 class="card-title fw-bold">${room.title}</h5>
                    <p class="card-text text-muted">
                        <i class="bi bi-geo-alt-fill text-danger"></i> ${room.location}
                    </p>
                    <p class="card-text"><strong>Price:</strong> $${room.price}/night</p>
                    <a href="/listings/${room._id}/booking" class="btn btn-success w-100 rounded-pill">Book Now</a>
                </div>
            </div>
        </div>
    `).join("");
}
