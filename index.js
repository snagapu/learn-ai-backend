const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI=require('openai');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getToolType = (question) => {
  const q = question.toLowerCase();
  if (q.includes('draw') || q.includes('diagram')) return 'diagram';
  if (q.includes('quiz') || q.includes('test me')) return 'quiz';
  return 'explanation';
};

app.post('https://learn-ai-backend.onrender.com/api/tutor', async (req, res) => {
  const { question } = req.body;
  const tool = getToolType(question);

  let prompt = '';
  switch (tool) {
    case 'diagram':
      prompt = `Generate a visual description of a diagram for the following concept so a designer can illustrate it later: ${question}`;
      break;
    case 'quiz':
      prompt = `Create a short 3-question quiz based on: ${question}. Include answers.`;
      break;
    default:
      prompt = `Explain this concept in a simple and clear way: ${question}`;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const answer = completion.data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`Tutor backend running at http://localhost:${port}`);
});
