import React from "react";
import ChatBox from "./ChatBox";  // Import the ChatBox component

function App() {
  return (
    <div className="App">
      <h1>AI Media Analysis Tool</h1>
      <ChatBox /> {/* Add the ChatBox here */}
    </div>
  );
}

export default App;


function App() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sources, setSources] = useState("");
  const [exclude, setExclude] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        query,
        from,
        to,
        sources,
        exclude,
      }).toString();

      const response = await fetch(
        `/api/news?${queryParams}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news articles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    const selectedText = selectedArticles
      .map((index) => articles[index].title)
      .join("\n");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Summarize and analyze these articles:\n${selectedText}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error with analysis:", error);
      setError("Failed to analyze articles. Please try again.");
    } finally {
      setIsLoading(false);
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

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      <h2>Results:</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
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
            <button
              onClick={handleAnalyze}
              style={{ marginTop: "20px" }}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Selected Articles"}
            </button>
          )}

          {analysis && (
            <div>
              <h3>AI Analysis:</h3>
              <p>{analysis}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

