import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [isPhishing, setIsPhishing] = useState(null);
  const [error, setError] = useState("");

  const extractFeatures = (url) => {
    try {
      const urlObj = new URL(url);
      
      // 1-5: Basic length features
      const length_url = url.length;
      const length_hostname = urlObj.hostname.length;
      const length_path = urlObj.pathname.length;
      const length_query = urlObj.search.length;
      const length_fragment = urlObj.hash.length;
      
      // 6-15: Character count features
      const num_dots = (url.match(/\./g) || []).length;
      const num_hyphens = (url.match(/-/g) || []).length;
      const num_underscores = (url.match(/_/g) || []).length;
      const num_slashes = (url.match(/\//g) || []).length;
      const num_equals = (url.match(/=/g) || []).length;
      const num_at = (url.match(/@/g) || []).length;
      const num_and = (url.match(/&/g) || []).length;
      const num_exclamation = (url.match(/!/g) || []).length;
      const num_space = (url.match(/ /g) || []).length;
      const num_tilde = (url.match(/~/g) || []).length;
      
      // 16-20: Binary features
      const has_https = urlObj.protocol === 'https:' ? 1 : 0;
      const has_port = urlObj.port ? 1 : 0;
      const has_fragment = urlObj.hash.length > 0 ? 1 : 0;
      const has_query = urlObj.search.length > 0 ? 1 : 0;
      const has_digits = /\d/.test(url) ? 1 : 0;
      
      // 21-25: Count-based features
      const num_digits = (url.match(/\d/g) || []).length;
      const num_letters = (url.match(/[a-zA-Z]/g) || []).length;
      const num_parameters = urlObj.search ? urlObj.search.substring(1).split('&').length : 0;
      const num_fragments = urlObj.hash ? urlObj.hash.substring(1).split('#').length : 0;
      const num_subdirectories = urlObj.pathname.split('/').filter(x => x.length > 0).length;
      
      // 26-30: Ratio and advanced features
      const digits_ratio = length_url > 0 ? num_digits / length_url : 0;
      const letters_ratio = length_url > 0 ? num_letters / length_url : 0;
      const special_chars_ratio = length_url > 0 ? (length_url - num_letters - num_digits) / length_url : 0;
      
      const directories = urlObj.pathname.split('/').filter(x => x.length > 0);
      const directory_length_mean = directories.length > 0 
        ? directories.reduce((sum, dir) => sum + dir.length, 0) / directories.length 
        : 0;
      
      const suspicious_tld = ['xyz', 'info', 'online', 'site', 'work'].includes(
        urlObj.hostname.split('.').pop()
      ) ? 1 : 0;
      
      // Original 30 features
      const originalFeatures = [
        length_url,
        length_hostname,
        length_path,
        length_query,
        length_fragment,
        num_dots,
        num_hyphens,
        num_underscores,
        num_slashes,
        num_equals,
        num_at,
        num_and,
        num_exclamation,
        num_space,
        num_tilde,
        has_https,
        has_port,
        has_fragment,
        has_query,
        has_digits,
        num_digits,
        num_letters,
        num_parameters,
        num_fragments,
        num_subdirectories,
        digits_ratio,
        letters_ratio,
        special_chars_ratio,
        directory_length_mean,
        suspicious_tld
      ];
      
      // Add 54 zeros to reach 84 features
      return [...originalFeatures, ...Array(54).fill(0)];
    } catch (error) {
      // Return zero-valued features if URL parsing fails
      return Array(84).fill(0);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setIsPhishing(null);

    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    // First try to make the URL valid if it doesn't have a protocol
    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = 'https://' + url;
    }

    try {

      const features = extractFeatures(validUrl);
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features }),
      });
    
      if (!response.ok) {
        throw new Error("Failed to fetch response from the backend.");
      }
    
      const data = await response.json();
      setResult(data.phishing_probability);
      setIsPhishing(data.is_phishing); // Ensure isPhishing is updated
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to analyze URL. Please try again.");
    }
    
  };

  // Determine result color based on phishing status
  const getResultClass = () => {
    if (isPhishing === "Yes") {
      return "phishing"; // Add this class in CSS
    } else if (isPhishing === "No") {
      return "safe"; // Add this class in CSS
    }
    return "";
  };
  
  return (
    <div className="container">
      <h1>Phishing Detection</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit">Check</button>
      </form>

      {result !== null && isPhishing !== null && (
      <div className={getResultClass()}>
        <p className="verdict">
          <strong>Verdict: {isPhishing === "Yes" ? "Phishing Website" : "Safe Website"}</strong>
        </p>
        <p>
          Phishing Probability: <strong>{(result * 100).toFixed(2)}%</strong>
        </p>
      </div>
)}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;