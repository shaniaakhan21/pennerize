import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [isProcessing, setIsProcessing] = useState(false); // State for processing status
  const [convertedText, setConvertedText] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData(); // Create form data for file upload
    formData.append('image', file);

    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, { // POST request to backend
        headers: {
          'Content-Type': 'multipart/form-data' // Specify multipart form data for file upload
        }
      });
      setConvertedText(response.data.blogPost); // Update state with converted text from response
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <h1>Blog from Handwritten Notes</h1>
      <p>Upload your handwritten note and let us convert it into a blog post!</p>
      <div className="upload-area">
        <input type="file" accept="image/*" disabled={isProcessing} onChange={handleUpload} />
        <button disabled={isProcessing} onClick={handleUpload}>
          {isProcessing ? (
              'Processing...'
            ) : (
              <div className="converted-text">
                {convertedText}
              </div>
            )}
        </button>
      </div>
      {/* Additional sections for processed text and editing can be added later */}
    </div>
  );
}

export default App;
