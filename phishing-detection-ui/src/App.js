import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [isPhishing, setIsPhishing] = useState(null);
  const [error, setError] = useState("");

  /**
   * Calculate Shannon entropy of a string
   * @param {string} str - Input string 
   * @returns {number} - Entropy value
   */
  const calculateEntropy = (str) => {
    const len = str.length;
    const frequencies = {};
    
    // Count character frequencies
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    
    // Calculate entropy
    return Object.values(frequencies).reduce((entropy, freq) => {
      const p = freq / len;
      return entropy - p * Math.log2(p);
    }, 0);
  };

  /**
   * Extract n-grams from a string
   * @param {string} str - Input string
   * @param {number} n - Size of n-gram
   * @returns {Object} - Count of each n-gram
   */
  const extractNgrams = (str, n) => {
    const ngrams = {};
    for (let i = 0; i <= str.length - n; i++) {
      const ngram = str.substring(i, i + n);
      ngrams[ngram] = (ngrams[ngram] || 0) + 1;
    }
    return ngrams;
  };

  /**
   * Calculate vowel to consonant ratio
   * @param {string} str - Input string
   * @returns {number} - Ratio value
   */
  const vowelConsonantRatio = (str) => {
    const vowels = (str.match(/[aeiou]/gi) || []).length;
    const consonants = (str.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
    return consonants > 0 ? vowels / consonants : 0;
  };

  /**
   * Count consecutive characters of the same type
   * @param {string} str - Input string 
   * @returns {number} - Maximum consecutive count
   */
  const maxConsecutiveChars = (str) => {
    if (!str) return 0;
    let max = 1;
    let current = 1;
    for (let i = 1; i < str.length; i++) {
      if (str[i] === str[i-1]) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 1;
      }
    }
    return max;
  };

  /**
   * Calculate variance of an array of numbers
   * @param {Array} arr - Array of numbers
   * @returns {number} - Variance
   */
  function calculateVariance(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }

  /**
   * Extract comprehensive URL features for phishing detection
   * @param {string} url - URL to analyze
   * @returns {Array} - Array of 84 features
   */
  const extractFeatures = (url) => {
    try {
      const urlObj = new URL(url);
      
      // Group 1: Basic length features (1-5)
      const length_url = url.length;
      const length_hostname = urlObj.hostname.length;
      const length_path = urlObj.pathname.length;
      const length_query = urlObj.search.length;
      const length_fragment = urlObj.hash.length;
      
      // Group 2: Character count features (6-15)
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
      
      // Group 3: Binary features (16-20)
      const has_https = urlObj.protocol === 'https:' ? 1 : 0;
      const has_port = urlObj.port ? 1 : 0;
      const has_fragment = urlObj.hash.length > 0 ? 1 : 0;
      const has_query = urlObj.search.length > 0 ? 1 : 0;
      const has_digits = /\d/.test(url) ? 1 : 0;
      
      // Group 4: Count-based features (21-25)
      const num_digits = (url.match(/\d/g) || []).length;
      const num_letters = (url.match(/[a-zA-Z]/g) || []).length;
      const num_parameters = urlObj.search ? urlObj.search.substring(1).split('&').length : 0;
      const num_fragments = urlObj.hash ? urlObj.hash.substring(1).split('#').length : 0;
      const num_subdirectories = urlObj.pathname.split('/').filter(x => x.length > 0).length;
      
      // Group 5: Ratio and advanced features (26-30)
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
      
      // Group 6: Domain-specific features (31-40)
      const domain = urlObj.hostname;
      const domain_length = domain.length;
      const subdomain_length = domain.split('.').slice(0, -2).join('.').length;
      const domain_token_count = domain.split('.').length;
      const is_ip = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain) ? 1 : 0;
      const has_subdomain = domain.split('.').length > 2 ? 1 : 0;
      const num_subdomains = Math.max(0, domain.split('.').length - 2);
      const domain_has_digit = /\d/.test(domain) ? 1 : 0;
      const domain_digit_ratio = domain_length > 0 ? (domain.match(/\d/g) || []).length / domain_length : 0;
      const domain_special_char_ratio = domain_length > 0 ? 
        (domain.length - (domain.match(/[a-zA-Z0-9]/g) || []).length) / domain_length : 0;
      
      // Group 7: Path and query features (41-50)
      const path = urlObj.pathname;
      const path_token_count = path.split('/').filter(Boolean).length;
      const max_path_token_length = path.split('/').filter(Boolean).reduce((max, token) => 
        Math.max(max, token.length), 0);
      const avg_path_token_length = path_token_count > 0 ?
        path.split('/').filter(Boolean).reduce((sum, token) => sum + token.length, 0) / path_token_count : 0;
      const query_variable_count = urlObj.search ? urlObj.searchParams.size : 0;
      const max_query_value_length = Array.from(urlObj.searchParams.values()).reduce((max, val) => 
        Math.max(max, val.length), 0);
      const avg_query_value_length = query_variable_count > 0 ?
        Array.from(urlObj.searchParams.values()).reduce((sum, val) => sum + val.length, 0) / query_variable_count : 0;
      const path_extension = path.split('.').pop() !== path ? path.split('.').pop() : '';
      const has_known_file_extension = ['html', 'php', 'asp', 'aspx', 'jsp', 'htm'].includes(path_extension) ? 1 : 0;
      const path_contains_phish_terms = /password|login|secure|account|banking|confirm|verify|signin/i.test(path) ? 1 : 0;
      
      // Group 8: Statistical features (51-60)
      const url_entropy = calculateEntropy(url);
      const domain_entropy = calculateEntropy(domain);
      const path_entropy = calculateEntropy(path);
      const max_consecutive_digits = maxConsecutiveChars(url.match(/\d+/g)?.join('') || '');
      const max_consecutive_chars = maxConsecutiveChars(url);
      const vowel_ratio = vowelConsonantRatio(url);
      const domain_vowel_ratio = vowelConsonantRatio(domain);
      const url_letter_distribution_variance = calculateVariance([...url].filter(c => 
        c.match(/[a-zA-Z]/)).map(c => c.toLowerCase().charCodeAt(0) - 97));
      const uppercase_ratio = length_url > 0 ? (url.match(/[A-Z]/g) || []).length / length_url : 0;
      const url_symbol_ratio = length_url > 0 ? (url.match(/[^\w\s]/g) || []).length / length_url : 0;
      
      // Group 9: URL token features (61-70)
      const url_token_count = url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).length;
      const avg_url_token_length = url_token_count > 0 ? 
        url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).reduce((sum, token) => sum + token.length, 0) / url_token_count : 0;
      const max_url_token_length = url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).reduce((max, token) => 
        Math.max(max, token.length), 0);
      const url_token_digit_ratio = url_token_count > 0 ?
        url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).filter(token => /\d/.test(token)).length / url_token_count : 0;
      const url_token_consonant_ratio = url_token_count > 0 ?
        url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).reduce((sum, token) => 
          sum + ((token.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length / token.length), 0) / url_token_count : 0;
      const url_token_special_ratio = url_token_count > 0 ?
        url.split(/[\/\.\?\-\=\&\#]+/).filter(Boolean).reduce((sum, token) => 
          sum + ((token.match(/[^\w\s]/g) || []).length / token.length), 0) / url_token_count : 0;
      const domain_token_entropy = domain.split('.').map(token => calculateEntropy(token)).reduce((sum, val) => sum + val, 0);
      const suspicious_words_count = (url.match(/login|account|update|secure|service|confirm|verify|authenticate|signin/gi) || []).length;
      const brand_name_distance = 5; // Placeholder for brand name edit distance - would need a database of brand names
      const number_of_redirects = 0; // Placeholder - would need HTTP requests
      
      // Group 10: Brand targeting features (71-77)
      const has_brand_terms = /paypal|apple|microsoft|amazon|google|facebook|twitter|instagram|netflix/i.test(url) ? 1 : 0;
      const has_misspelled_brand = /paypaI|appIe|m1crosoft|amaz0n|g00gle|faceb00k|tw1tter/i.test(url) ? 1 : 0;
      const has_security_terms = /secure|safe|verify|confirm|authenticate|login|signin|password/i.test(url) ? 1 : 0;
      const has_action_terms = /update|change|submit|access|click|check|activate|verify/i.test(url) ? 1 : 0;
      const has_finance_terms = /bank|credit|debit|payment|transfer|money/i.test(url) ? 1 : 0;
      const domain_age_proxy = 5; // Placeholder - would need WHOIS data
      const suspicious_url_pattern = /bit\.ly|tinyurl|goo\.gl/i.test(url) ? 1 : 0;
      
      // Group 11: Additional security features (78-84)
      const has_excessive_subdomains = num_subdomains > 3 ? 1 : 0;
      const has_punycode = /xn--/.test(domain) ? 1 : 0;
      const has_double_extensions = /\.[a-z]+\.[a-z]+$/.test(path) ? 1 : 0;
      const has_javascript_obfuscation = /\\x|\\u|%[0-9a-fA-F]{2}/.test(url) ? 1 : 0;
      const has_excessive_hexadecimal = (url.match(/%[0-9a-fA-F]{2}/g) || []).length > 5 ? 1 : 0;
      const has_mixed_unicode = /[\u0080-\uFFFF]/.test(url) ? 1 : 0;
      const has_multiple_tlds = (domain.match(/\.[a-z]+/gi) || []).length > 1 ? 1 : 0;
      
      // Combine all features
      return [
        // Original 30 features
        length_url, length_hostname, length_path, length_query, length_fragment,
        num_dots, num_hyphens, num_underscores, num_slashes, num_equals,
        num_at, num_and, num_exclamation, num_space, num_tilde,
        has_https, has_port, has_fragment, has_query, has_digits,
        num_digits, num_letters, num_parameters, num_fragments, num_subdirectories,
        digits_ratio, letters_ratio, special_chars_ratio, directory_length_mean, suspicious_tld,
        
        // Additional 54 features
        domain_length, subdomain_length, domain_token_count, is_ip, has_subdomain,
        num_subdomains, domain_has_digit, domain_digit_ratio, domain_special_char_ratio, domain_entropy,
        
        path_token_count, max_path_token_length, avg_path_token_length, query_variable_count, max_query_value_length,
        avg_query_value_length, has_known_file_extension, path_contains_phish_terms, path_entropy, url_entropy,
        
        max_consecutive_digits, max_consecutive_chars, vowel_ratio, domain_vowel_ratio, url_letter_distribution_variance,
        uppercase_ratio, url_symbol_ratio, url_token_count, avg_url_token_length, max_url_token_length,
        
        url_token_digit_ratio, url_token_consonant_ratio, url_token_special_ratio, domain_token_entropy, suspicious_words_count,
        brand_name_distance, number_of_redirects, has_brand_terms, has_misspelled_brand, has_security_terms,
        
        has_action_terms, has_finance_terms, domain_age_proxy, suspicious_url_pattern, has_excessive_subdomains,
        has_punycode, has_double_extensions, has_javascript_obfuscation, has_excessive_hexadecimal, has_mixed_unicode,
        
        has_multiple_tlds, 0, 0, 0 // Padding to reach exactly 84 features
      ];
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