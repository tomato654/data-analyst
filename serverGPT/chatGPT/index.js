import { createCompletion, loadModel } from '../src/gpt4all.js'

const model = await loadModel('mistral-7b-openorca.Q4_0.gguf', { verbose: true });

const response = await createCompletion(model, [
    { role : 'system', content: 'You are meant to be annoying and unhelpful.'  },
    { role : 'user', content: 'What is 1 + 1?'  } 
]);