// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { showMap, queueNotification } from "./map.js"; // Import queueNotification from map.js


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQZXeQ_sxkOeHo5PeNT1NbwfURYypMIJQ",
  authDomain: "sia101-activity-2-inalem1.firebaseapp.com",
  databaseURL: "https://sia101-activity-2-inalem1-default-rtdb.firebaseio.com",
  projectId: "sia101-activity-2-inalem1",
  storageBucket: "sia101-activity-2-inalem1.appspot.com",
  messagingSenderId: "708155932167",
  appId: "1:708155932167:web:fb0abdec7dcfd54833b4a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to toggle between login and signup forms
window.toggleForms = function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block'; // Show login form
        signupForm.style.display = 'none'; // Hide signup form
    } else {
        loginForm.style.display = 'none'; // Hide login form
        signupForm.style.display = 'block'; // Show signup form
    }

    // Reset input fields when toggling forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
};

window.login = async function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');

        // Create login notification
        const loginNotification = {
            action: "Login",
            email: email, // Separate email
            timestamp: new Date().toISOString(),
        };

        queueNotification(loginNotification); // Queue the notification for display
        showMap(); // Show the map after login
    } catch (error) {
        alert(error.message);
    }
};

window.signup = async function(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Signup successful! Please log in.');
        toggleForms(); // Switch to the login form
    } catch (error) {
        alert(error.message);
    }
};

// Function to log out user and reset forms
window.logout = function() {
    // Reset input fields
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';

    // Reset notifications
    const notificationElement = document.getElementById('notification');
    notificationElement.innerHTML = ''; // Clear notifications

    // Show the login form
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
};
