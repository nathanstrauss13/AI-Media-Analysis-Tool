# Media AI Analysis Tool

A web application that allows users to search for news articles and analyze them using AI. Built with React, Node, Express, NewsAPI, and OpenAI's GPT-3.5.

## Prerequisites

Before you begin, ensure you have:
- Node.js installed (v16+ recommended)
- API keys for:
  - [NewsAPI](https://newsapi.org/)
  - [OpenAI](https://platform.openai.com/)

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-Media-Analysis-Tool
   ```

2. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add your API keys:

     ```bash
     NEWS_API_KEY=your_news_api_key_here
     OPENAI_API_KEY=your_openai_api_key_here
     ```

3. **Install Dependencies**

   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

4. **Build the React App**

   ```bash
   cd client
   npm run build
   cd ..
   ```

## Running the Application

### Development Mode
1. Start the server from the root directory:

   ```bash
   npm start
   ```

2. In a separate terminal, start the React server from the client directory:

   ```bash
   cd client
   npm start
   ```

## Features
- Search for news articles using keywords
- View article summaries and details
- AI-powered analysis of news content
- Responsive design for desktop and mobile

## Tech Stack
- Frontend: React
- Backend: Node.js, Express
- APIs: NewsAPI, OpenAI GPT-3.5

The application will be available at `http://localhost:3000`
