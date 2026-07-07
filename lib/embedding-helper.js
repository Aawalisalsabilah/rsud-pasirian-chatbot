import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export async function embedTextWithRetry(text, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      lastError = err;
      console.error(
        `[EMBEDDING ATTEMPT ${attempt}/${maxRetries} FAILED]`,
        err.message,
        err.cause ? `| cause: ${err.cause.message || err.cause}` : ''
      );

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw new Error(
    `Gagal generate embedding setelah ${maxRetries} percobaan. Error terakhir: ${lastError.message}`
  );
}
