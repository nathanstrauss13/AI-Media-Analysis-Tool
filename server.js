const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { query, from, to, sources, exclude } = req.query;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    let url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;

    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    if (sources) url += `&sources=${sources}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('News API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze articles' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Analysis endpoint for ChatGPT interaction
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body; // Extract the prompt from the request body
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Make the POST request to OpenAI's API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo", // Or "gpt-4" if you prefer
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Return the analysis response back to the client
    const analysis = response.data.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error("Error with OpenAI:", error);
    res.status(500).json({ error: "Failed to get analysis from OpenAI" });
  }
});
