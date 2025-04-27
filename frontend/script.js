document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('url-input');
  const checkBtn = document.getElementById('check-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultContainer = document.getElementById('result');
  
  if (urlInput && checkBtn && clearBtn) {
      // Enable/disable check button based on input
      urlInput.addEventListener('input', function() {
          checkBtn.disabled = !urlInput.value.trim();
      });
      
      // Clear button functionality
      clearBtn.addEventListener('click', function() {
          urlInput.value = '';
          checkBtn.disabled = true;
          resultContainer.classList.add('hidden');
          resultContainer.innerHTML = '';
      });
      
      // Check button functionality
      checkBtn.addEventListener('click', function() {
          const url = urlInput.value.trim();
          if (!url) return;
          
          // Show loading state
          checkBtn.disabled = true;
          checkBtn.textContent = 'Checking...';
          resultContainer.classList.add('hidden');
          
          // Send URL to backend
          fetch('http://localhost:5000/predict', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url })
          })
          .then(response => response.json())
          .then(data => {
              displayResult(data); // Pass the backend response to display
          })
          .catch(error => {
              console.error('Error:', error);
              resultContainer.innerHTML = '<p>An error occurred while checking the URL.</p>';
              resultContainer.classList.remove('hidden');
          })
          .finally(() => {
              // Reset button
              checkBtn.disabled = false;
              checkBtn.textContent = 'Check';
          });
      });
      
      // Allow pressing Enter to submit
      urlInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
              e.preventDefault();
              if (!checkBtn.disabled) {
                  checkBtn.click();
              }
          }
      });
  }
  
  // Function to display the result
  function displayResult(data) {
      resultContainer.innerHTML = '';
      resultContainer.classList.remove('hidden', 'result-safe', 'result-danger');
      
      if (data.label.toLowerCase() === 'safe') {
          resultContainer.classList.add('result-safe');
          resultContainer.innerHTML = `
              <p>This URL appears to be safe with a probability of ${Math.round(data.probability * 100)}%.</p>
          `;
      } else {
          resultContainer.classList.add('result-danger');
          resultContainer.innerHTML = `
              <p>This URL may be phishing with a probability of ${Math.round(data.probability * 100)}%.</p>
          `;
      }
      
      resultContainer.classList.remove('hidden');
  }
});


// // My new code begins >>>>

// document.addEventListener('DOMContentLoaded', function() {
//     const urlInput = document.getElementById('url-input');
//     const checkBtn = document.getElementById('check-btn');
//     const clearBtn = document.getElementById('clear-btn');
//     const resultDiv = document.getElementById('result');

//     if (urlInput) {
//         urlInput.addEventListener('input', () => {
//             checkBtn.disabled = urlInput.value.trim() === '';
//         });
//     }

//     if (checkBtn) {
//         checkBtn.addEventListener('click', () => {
//             const url = urlInput.value.trim();

//             if (url) {
//                 fetch('/prediction', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ url: url }),
//                 })
//                 .then(response => response.json())
//                 .then(data => {
//                     resultDiv.classList.remove('hidden');
//                     resultDiv.innerHTML = `<h3>Result: ${data.result}</h3>`;
//                 })
//                 .catch(error => {
//                     console.error('Error:', error);
//                     resultDiv.classList.remove('hidden');
//                     resultDiv.innerHTML = `<h3 style="color: red;">Error predicting URL</h3>`;
//                 });
//             }
//         });
//     }

//     if (clearBtn) {
//         clearBtn.addEventListener('click', () => {
//             urlInput.value = '';
//             checkBtn.disabled = true;
//             resultDiv.classList.add('hidden');
//             resultDiv.innerHTML = '';
//         });
//     }
// });
