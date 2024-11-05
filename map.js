let notifications = []; // Array to store all notifications
let isNotificationOpen = false; // Flag to track if the notification modal is open
let isLoggedIn = false; // Flag to track if the user is logged in

// Function to be called when user successfully logs in
function onLoginSuccess() {
    isLoggedIn = true; // Set the logged-in flag
    showMap(); // Call showMap when login is successful
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            // Handle your login logic here
        });
    }
});

export function showMap() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('map-container').style.display = 'block';

    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        if (isNotificationOpen) { 
            alert('Please close the notification before searching another location.');
            return; 
        }
        const query = document.getElementById('search-input').value;
        searchLocation(query, map);
    });

    document.getElementById('search-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            if (isNotificationOpen) {
                alert('Please close the notification before searching another location.');
                return; 
            }
            const query = event.target.value;
            searchLocation(query, map);
        }
    });

    // Add event listener to the notification button
    const notificationButton = document.getElementById('notification-button');
    notificationButton.addEventListener('click', () => {
        showNotification(); // Show notification when button is clicked
        hideNotificationIndicator(); // Hide the notification indicator
    });

    // Add event listener for the logout button
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logout(); // Call logout function
    });

    // Add event listener to close the modal
    document.getElementById('close-button').addEventListener('click', () => {
        closeNotification(); // Close the notification modal
        hideNotificationIndicator(); // Hide the indicator when modal is closed
    });
}

let requestQueue = [];
let isRequestProcessing = false;

// Function to send a webhook notification to the server
async function sendWebhook(notification) {
    const serverURL = 'http://localhost:3000/send-webhook'; // Send to the local server endpoint

    const response = await fetch(serverURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send notification to server: ${errorText}`);
    }

    return await response.json();
}

// Function to process queued webhook requests
async function processQueue() {
    if (isRequestProcessing || requestQueue.length === 0) return;

    isRequestProcessing = true;
    const notification = requestQueue.shift();

    try {
        await sendWebhook(notification);
        console.log("Notification sent successfully:", notification);
        
        notifications.unshift(notification); // Store the latest notification at the top of the notifications array
    } catch (error) {
        console.error("Failed to send notification:", error);
        requestQueue.unshift(notification); // Re-add to queue if failed
    } finally {
        isRequestProcessing = false;
        if (requestQueue.length > 0) {
            setTimeout(processQueue, 500); // Process next request after a delay
        }
    }
}

// Queue a new webhook notification
export function queueNotification(notification) {
    requestQueue.push(notification);
    showNotificationIndicator(); // Show the notification indicator when a new notification is queued
    processQueue();
}

// Function to search location and add to map
function searchLocation(query, map) {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                map.setView([location.lat, location.lon], 13);
                L.marker([location.lat, location.lon])
                    .addTo(map)
                    .bindPopup(location.display_name)
                    .openPopup();

                // Create a new notification for the location search
                const notification = {
                    action: "Location Search",
                    location: location.display_name,
                    timestamp: new Date().toISOString(),
                };

                queueNotification(notification); // Queue the notification
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('Error fetching location: ' + error.message);
        });
}

// Function to show notification when the button is clicked
function showNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');
    const notificationElement = document.getElementById('notification');

    // Clear previous notifications
    notificationElement.innerHTML = '';

    if (notifications.length > 0) {
        notifications.forEach((notif) => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';

            // Check if the notification is a location search
            if (notif.action === "Location Search") {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Location:</strong> ${notif.location} - <strong>Timestamp:</strong> ${notif.timestamp}`;
            } else if (notif.action === "Login") {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Email:</strong> ${notif.email} - <strong>Timestamp:</strong> ${notif.timestamp}`;
            }

            notificationElement.appendChild(notificationItem);
        });
    } else {
        notificationElement.innerHTML = '<p>No notifications available.</p>';
    }

    overlay.style.display = 'block';
    notificationModal.style.display = 'block';
    isNotificationOpen = true;
}



// Function to hide the notification indicator
function hideNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'none'; // Hide notification indicator
}

// Function to show the notification indicator
function showNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'block'; // Show notification indicator
}

// Function to close the notification modal
function closeNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');

    overlay.style.display = 'none'; // Hide overlay
    notificationModal.style.display = 'none'; // Hide notification modal
    isNotificationOpen = false; // Reset notification open flag
}

// Function to handle user logout
function logout() {
    isLoggedIn = false; // Reset logged-in flag
    notifications = []; // Clear all notifications
    clearInputFields(); // Clear input fields
    showLoginForm(); // Show the login form
}

// Function to clear input fields in login and signup forms
function clearInputFields() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
}

// Function to show the login form
function showLoginForm() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('map-container').style.display = 'none';
}




// Dummy functions to simulate login and signup
function login(event) {
    event.preventDefault(); // Prevent form submission
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const notification = {
        action: "Login",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(notification); // Queue the login notification
    onLoginSuccess(); // Call onLoginSuccess to proceed to the map
}

function signup(event) {
    event.preventDefault(); // Prevent form submission
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const notification = {
        action: "Sign Up",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(notification); // Queue the signup notification
    alert('Sign up successful! You can now log in.'); // Show alert on signup success
}
