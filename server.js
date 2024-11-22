const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();  // Load environment variables from .env file
const { OpenAI } = require("openai");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());  // Middleware to parse JSON bodies

const PORT = process.env.PORT || 5002;  // Change port to 5002

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Your OpenAI API key from the .env file
});

// Route for /news (News API integration)
app.get('/news', async (req, res) => {
    const { query, from, to, sources, exclude } = req.query;

    // Build the URL to call the News API
    const url = `https://newsapi.org/v2/everything`;

    try {
        const response = await axios.get(url, {
            params: {
                q: query,               // Search query
                from,                    // From date
                to,                      // To date
                sources,                 // Sources of news
                exclude,                 // Words to exclude
                apiKey: process.env.NEWS_API_KEY,  // News API key from .env
            },
        });
        res.json(response.data);  // Return the fetched news articles
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for /analyze (AI Analysis using OpenAI)
app.post('/analyze', async (req, res) => {
    const { prompt } = req.body;  // Get the prompt from the request body
    console.log('Received prompt:', prompt);  // Log the received prompt for debugging

    try {
        // Send the prompt to OpenAI's GPT model for analysis
        const completion = await openai.chat.completions.create({
            model: "gpt-4",  // Replace with the model you're using (e.g., GPT-3 or GPT-4)
            messages: [{ role: "user", content: prompt }],
        });

        // Send back the analysis as a response
        res.json({ analysis: completion.choices[0].message.content });
    } catch (error) {
        console.error("Error with OpenAI:", error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
