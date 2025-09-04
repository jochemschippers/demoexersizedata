const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use an environment variable to securely store your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001"});
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding API Error:', error);
    throw new Error('Failed to get embedding from the API.');
  }
}

module.exports = { getEmbedding };