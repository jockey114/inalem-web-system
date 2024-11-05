const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

let notifications = []; // Store notifications in memory

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Endpoint to receive data and forward to Webhook.site
app.post('/send-webhook', async (req, res) => {
    console.log('Received request body:', req.body); // Log incoming request data
    
    const webhookUrl = 'https://webhook.site/b9cc2f0d-402d-4022-a423-74e1bcabe1ff'; // Replace with the correct Webhook.site POST URL

    try {
        // Forward request to Webhook.site
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Webhook response data:', response.data); // Log response from Webhook.site
        notifications.push(req.body); // Store notification
        res.status(200).json({
            message: 'Data sent to webhook successfully',
            data: response.data,
        });
    } catch (error) {
        console.error('Error sending data to webhook:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to send data to webhook',
            error: error.response?.data || error.message,
        });
    }
});

// New endpoint to get notifications
app.get('/notifications', (req, res) => {
    res.status(200).json(notifications); // Return stored notifications
});

// Start the server
app.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
});
