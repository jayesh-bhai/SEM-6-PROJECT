function checkURL() {
    const url = document.getElementById('urlInput').value.trim();
    const result = document.getElementById('result');
  
    if (!url) {
      result.innerText = "Please enter a URL.";
      return;
    }
  
    fetch('http://localhost:5000/predict', { // Update the port if needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
      result.innerText = `Result: ${data.label} (Probability: ${Math.round(data.probability * 100)}%)`;
    })
    .catch(error => {
      console.error('Error:', error);
      result.innerText = "An error occurred while predicting.";
    });
  }
  
  function clearInput() {
    document.getElementById('urlInput').value = '';
    document.getElementById('result').innerText = '';
  }
  