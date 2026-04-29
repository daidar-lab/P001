import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

async function test() {
  console.log('Testando Ollama...');
  try {
    const response = await ollama.generate({
      model: 'llama3',
      prompt: 'Olá, você está funcionando?',
      stream: false
    });
    console.log('Resposta:', response.response);
  } catch (error) {
    console.error('Erro:', error);
  }
}

test();
