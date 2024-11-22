const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// News API endpoint
app.get('/news', async (req, res) => {
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
app.post('/analyze', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
