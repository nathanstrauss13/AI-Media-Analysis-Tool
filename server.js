const express = require('express')
const cors = require('cors')
const axios = require('axios')
const path = require('path')
const { JSDOM } = require('jsdom')
const { Readability } = require('@mozilla/readability')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')))

// News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { query, from, to, sources } = req.query;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    let url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    if (sources) url += `&sources=${sources}`;

    // Fetch News API articles
    const newsResponse = await axios.get(url);
    const articles = newsResponse.data.articles;

    if (!articles || articles.length === 0) {
      return res.status(404).json({ error: 'No articles found.' });
    }

    // Parse the full content of each article
    const parsedArticles = await Promise.all(
      articles.map(async (article, index) => {
         
        try {
          // Fetch the article HTML
          const articleHtmlResponse = await axios.get(article.url);

          // Parse the HTML using JSDOM and Readability
          const dom = new JSDOM(articleHtmlResponse.data, {
            url: article.url, // Required for Readability to resolve relative URLs
          });
          const parsedArticle = new Readability(dom.window.document).parse();

          console.log('REG length:', articles.length)
          console.log('PARSED length:', parsedArticle.length)
          console.log('REG TITLES:',  article.title)
          console.log('PARSED TITLES:', parsedArticle?.title, article.title)
          console.log('REG CONTENT:', article.content)
          console.log('PARSED CONTENT:', parsedArticle?.textContent)                  

          return {
            title: parsedArticle?.title || article.title,
            content: parsedArticle?.textContent || article.content,
            description: parsedArticle?.description || article.description,
            url: article.url,
            source: article.source.name,
          };
        } catch (error) {
          console.error(`Error parsing article at ${article.url}:`, error.message);
          return {
            title: article.title,
            content: 'Content could not be fetched or parsed.',
            url: article.url,
            source: article.source.name,
          };
        }
      })
    );

    res.json(parsedArticles);
  } catch (error) {
    console.error('News API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news or parse articles.' });
  }
});

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const {prompt} = req.body
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: prompt}],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    res.json({analysis: response.data.choices[0].message.content})
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message)
    res.status(500).json({error: 'Failed to analyze articles'})
  }
})

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
// Analysis endpoint for ChatGPT interaction
app.post('/api/analyze', async (req, res) => {
  try {
    const {prompt} = req.body // Extract the prompt from the request body
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    // Make the POST request to OpenAI's API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Or "gpt-4" if you prefer
        messages: [{role: 'user', content: prompt}],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Return the analysis response back to the client
    const analysis = response.data.choices[0].message.content
    res.json({analysis})
  } catch (error) {
    console.error('Error with OpenAI:', error)
    res.status(500).json({error: 'Failed to get analysis from OpenAI'})
  }
})
