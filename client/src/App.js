import React, { useState } from "react";

function App() {
  const [query, setQuery] = useState(""); // User query for the analysis
  const [from, setFrom] = useState(""); // From date for news search (Advanced)
  const [to, setTo] = useState(""); // To date for news search (Advanced)
  const [sources, setSources] = useState(""); // Sources for news search (Advanced)
  const [exclude, setExclude] = useState(""); // Exclude words for news search (Advanced)
  const [articles, setArticles] = useState([]); // List of articles from API
  const [selectedArticles, setSelectedArticles] = useState([]); // Articles selected for analysis
  const [summary, setSummary] = useState(""); // Store the AI's summary
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error message for API calls
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false); // Toggle for advanced search UI

  // Fetch news articles based on user input
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        query,
        from: isAdvancedSearch ? from : "", // Only include 'from' and 'to' if advanced search
        to: isAdvancedSearch ? to : "",
        sources: isAdvancedSearch ? sources : "",
        exclude: isAdvancedSearch ? exclude : "",
      }).toString();

      const response = await fetch(`/api/news?${queryParams}`, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter out articles with a URL containing "https://removed.com/" or status "removed" or containing "[Removed]" in any of the article fields
      const filteredArticles = data.articles.filter(
        (article) =>
          !article.url.includes("https://removed.com/") &&
          article.status !== "removed" &&
          !article.title.includes("[Removed]") && 
          !article.description?.includes("[Removed]") && 
          !article.content?.includes("[Removed]")
      );
      setArticles(filteredArticles);

      // Automatically select all articles when results are returned
      setSelectedArticles(filteredArticles.map((_, index) => index));
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news articles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize the selected articles using GPT
  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);

    // Get the titles and summaries of the selected articles
    const selectedText = selectedArticles
      .map((index) => {
        const article = articles[index];
        return `Title: ${article.title}\nSummary: ${article.description || article.content || "No summary available."}\n`;
      })
      .join("\n");

    // Combine the articles' information with the user's query
    const userQuery = `You are given a list of articles. Please answer the following query based on these articles:\n\nArticles:\n${selectedText}\n\nQuery: ${query}`;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: userQuery,  // Pass the prompt with articles and user query
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.analysis);
    } catch (error) {
      console.error("Error with analysis:", error);
      setError("Failed to analyze articles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the selection and deselection of articles
  const handleArticleSelection = (index) => {
    setSelectedArticles((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  // Handle "Select All" and "Unselect All"
  const handleSelectAll = () => {
    setSelectedArticles(articles.map((_, index) => index));
  };

  const handleUnselectAll = () => {
    setSelectedArticles([]);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "'Montserrat', sans-serif", backgroundColor: "#000000", color: "#eaeaea", maxWidth: "900px", margin: "auto", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>AI Media Analysis Tool</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} style={{ marginBottom: "20px", textAlign: "center" }}>
        <div>
          <label style={{ fontSize: "1.2em", marginRight: "10px" }}>Search Query: </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Apple"
            required
            style={{ padding: "10px", fontSize: "1em", borderRadius: "5px", marginBottom: "10px", width: "80%" }}
          />
        </div>

        {/* Advanced search button */}
        <div>
          <button 
            type="button" 
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)} 
            style={{ padding: "10px 20px", backgroundColor: "#9E9E9E", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", marginBottom: "15px" }}>
            Advanced Search
          </button>
        </div>

        {isAdvancedSearch && (
          <>
            <div>
              <label>From Date: </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{ padding: "10px", marginBottom: "10px" }}
              />
            </div>
            <div>
              <label>To Date: </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ padding: "10px", marginBottom: "10px" }}
              />
            </div>
            <div>
              <label>Sources (comma-separated): </label>
              <input
                type="text"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                placeholder="e.g., bbc-news, cnn"
                style={{ padding: "10px", marginBottom: "10px" }}
              />
            </div>
            <div>
              <label>Exclude Words: </label>
              <input
                type="text"
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
                placeholder="e.g., politics"
                style={{ padding: "10px", marginBottom: "10px" }}
              />
            </div>
          </>
        )}

        <button type="submit" disabled={isLoading} style={{ padding: "10px 20px", backgroundColor: "#616161", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", marginBottom: "15px" }}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {articles.length > 0 && summary && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#fff" }}>AI Summary:</h3>
          <p>{summary}</p>
        </div>
      )}

      {/* Summarize Button placed above the article list */}
      {selectedArticles.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={handleSummarize}
            style={{
              padding: "10px 20px",
              backgroundColor: "#616161",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Summarizing..." : "Summarize Selected Articles"}
          </button>
        </div>
      )}

      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {articles.map((article, index) => (
          <li key={index} style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#222", borderRadius: "5px" }}>
            <input
              type="checkbox"
              checked={selectedArticles.includes(index)}
              onChange={() => handleArticleSelection(index)}
              style={{ marginRight: "10px" }}
            />
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "none" }}>
              {article.title}
            </a>
          </li>
        ))}
      </ul>

      {/* Select All/Unselect All Buttons */}
      {articles.length > 0 && (
        <div style={{ textAlign: "center" }}>
          <button onClick={handleSelectAll} style={{ padding: "10px", margin: "5px", backgroundColor: "#616161", color: "#fff", border: "none", borderRadius: "5px" }}>
            Select All
          </button>
          <button onClick={handleUnselectAll} style={{ padding: "10px", margin: "5px", backgroundColor: "#616161", color: "#fff", border: "none", borderRadius: "5px" }}>
            Unselect All
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
