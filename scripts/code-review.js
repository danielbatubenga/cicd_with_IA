const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configure a chave da API do OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-3.5-turbo'; // ou outro modelo que você deseja usar

// Função para revisar o código
async function reviewCode(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Revise o seguinte código e sugira melhorias:\n\n${code}`
        }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Feedback from ChatGPT:');
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error contacting OpenAI API:', error);
  }
}

// Executar a revisão
const filePath = path.resolve(process.argv[2]);
reviewCode(filePath);
