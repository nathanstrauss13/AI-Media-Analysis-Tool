import React, { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sources, setSources] = useState("");
  const [exclude, setExclude] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [analysis, setAnalysis] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5001/news?query=${query}&from=${from}&to=${to}&sources=${sources}&exclude=${exclude}`
      );
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleAnalyze = async () => {
    const selectedText = selectedArticles
      .map((index) => articles[index].title)
      .join("\n");

    try {
        const response = await fetch("http://localhost:5001/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: `Summarize and analyze these articles:\n${selectedText}`,
            }),
        });

        const data = await response.json();
        setAnalysis(data.analysis);
    } catch (error) {
        console.error("Error with analysis:", error);
    }
};


  const handleArticleSelection = (index) => {
    setSelectedArticles((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Media AI Analysis Tool</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <div>
          <label>Search Query: </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Apple"
            required
          />
        </div>
        <div>
          <label>From Date: </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label>To Date: </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <label>Sources (comma-separated): </label>
          <input
            type="text"
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="e.g., bbc-news, cnn"
          />
        </div>
        <div>
          <label>Exclude Words: </label>
          <input
            type="text"
            value={exclude}
            onChange={(e) => setExclude(e.target.value)}
            placeholder="e.g., politics"
          />
        </div>
        <button type="submit">Search</button>
      </form>

      <h2>Results:</h2>
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={selectedArticles.includes(index)}
              onChange={() => handleArticleSelection(index)}
            />
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </li>
        ))}
      </ul>

      {selectedArticles.length > 0 && (
        <button onClick={handleAnalyze} style={{ marginTop: "20px" }}>
          Analyze Selected Articles
        </button>
      )}

      {analysis && (
        <div>
          <h3>AI Analysis:</h3>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}

export default App;

