const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const { OpenAI } = require('openai');
require('dotenv').config();
const cors = require('cors')
const process = require('process')

const app = express();
app.use(cors())
const upload = multer({ 
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024, // Adjust the file size limit as needed (e.g., 10 MB)
    }
  });

// Replace with your project ID and service account key path for Google Cloud Vision

const apiKey = process.env.OPENAI_API_KEY;
const openaiClient = new OpenAI({ apiKey });
const keyFilename = 'service.json';

process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilename


// Function to call Google Cloud Vision API
async function getVisionText(filePath) {
  const vision = require('@google-cloud/vision');

  // Replace with your project ID
  const projectId = 'subtitles-408107';
  // Replace with required scopes
  const scopes = ['https://www.googleapis.com/auth/cloud-vision'];

  try {
    // Access the auth object directly (no destructuring)
    const auth = await google.auth.getClient({ projectId, scopes });

    const vision1 = new vision.ImageAnnotatorClient({ client: auth });

    const [result] = await vision1.textDetection({
      image: {
        content: fs.readFileSync(filePath, 'base64').toString(), // Read and base64 encode image
      },
    });

    const fullText = result.fullTextAnnotation.text;
    console.log("TEXTXTXTTXT", fullText)
    return fullText;
  } catch (error) {
    throw error; // Re-throw the error for handling in the main function
  }
}
  

// Function to rephrase text with OpenAI (replace with actual model if unavailable)
async function rephraseToBlogPost(text) {
  const response = await openaiClient.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: "Rephrase the following text into a well-structured blog post:\n" + text,
    max_tokens: 1500,
    temperature: 0,
  });
  console.log("RESPONSEE",response)
  const blogPost = response.choices[0].text;
  console.log("blogPost", blogPost)
  return blogPost;
}

app.post('/upload', upload.single('image'), async (req, res) => {
    const { file } = req;
  
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    console.log("Uploaded file size:", file.size); // Log file size for debugging
  
    try {
      const extractedText = await getVisionText(file.path);
      console.log("VISISON TEXT", extractedText)
      const blogPost = await rephraseToBlogPost(extractedText);
  
      res.json({ blogPost }); // Send generated blog post
    } catch (error) {
      console.error(error);
      if (error.code === 413) {
        res.status(413).json({ error: 'Image file size exceeds limit' });
      } else {
        res.status(500).json({ error: 'Error processing image' });
      }
    } finally {
      fs.unlinkSync(file.path); // Clean up uploaded file
    }
  });

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
