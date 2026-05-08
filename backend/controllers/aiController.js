const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const GENRE_MAP = {
  action: '28',
  comedy: '35',
  drama: '18',
  happy: '35',
  romance: '10749',
  romantic: '10749',
  sad: '18',
  thriller: '53',
  horror: '27',
  'sci-fi': '878',
  scifi: '878',
  'science fiction': '878'
};

const LANGUAGE_MAP = {
  bollywood: 'hi',
  hindi: 'hi',
  telugu: 'te',
  tamil: 'ta',
  malayalam: 'ml',
  korean: 'ko',
  japanese: 'ja',
  english: 'en'
};

const parseQueryLocally = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedGenres = [...new Set(
    Object.entries(GENRE_MAP)
      .filter(([label]) => normalizedQuery.includes(label))
      .map(([, id]) => id)
  )];

  const matchedLanguage = Object.entries(LANGUAGE_MAP)
    .find(([label]) => normalizedQuery.includes(label))?.[1];

  if (matchedGenres.length > 0 || matchedLanguage) {
    return {
      type: 'discover',
      ...(matchedGenres.length > 0 ? { with_genres: matchedGenres.join(',') } : {}),
      ...(matchedLanguage ? { with_original_language: matchedLanguage } : {})
    };
  }

  return {
    type: 'search',
    query: query.trim()
  };
};

// @desc    Convert natural language to TMDB params
// @route   POST /api/ai/search
// @access  Public
const nlpSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    if (!ai) {
      return res.json(parseQueryLocally(query));
    }

    const prompt = `
      You are a movie recommendation assistant. Given a natural language query, extract the intent into a JSON object 
      that can be used to query the TMDB discover API or search API. 
      Only return valid JSON, no markdown formatting.
      Rules:
      - If it's a specific movie name (e.g., "Inception", "Avengers"), return {"type": "search", "query": "movie_name"}
      - If it's a genre or mood (e.g., "romantic movies", "funny action"), return {"type": "discover", "with_genres": "genre_ids_comma_separated"}
      - Map genres to TMDB IDs: Action(28), Comedy(35), Drama(18), Romance(10749), Thriller(53), Horror(27), Sci-Fi(878).
      - If language is mentioned (e.g., "Bollywood", "Hindi"), set "with_original_language" to "hi" (Hindi), "te" (Telugu), "ta" (Tamil), "ml" (Malayalam), "ko" (Korean), "ja" (Japanese), "en" (English).
      
      Query: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text;
    
    // Clean up potential markdown formatting from Gemini
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/```json\n/g, '').replace(/```/g, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/```\n/g, '').replace(/```/g, '');
    }

    const parsedData = JSON.parse(resultText.trim());

    res.json(parsedData);
  } catch (error) {
    res.json(parseQueryLocally(req.body.query));
  }
};

module.exports = { nlpSearch };
