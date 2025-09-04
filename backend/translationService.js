const translate = require("translate-google");

async function translateText(text, targetLanguage = "en") {
  if (!text || text.trim() === "") {
    return "";
  }
  try {
    const translation = await translate(text, { to: targetLanguage });
    return translation;
  } catch (error) {
    console.error("Translation API Error:", error);
    // Return original text on failure to prevent the app from crashing
    return text;
  }
}

module.exports = {
  translateText,
};
