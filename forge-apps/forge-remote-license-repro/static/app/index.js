import { invoke } from '@forge/bridge';

const output = document.getElementById('output');
const button = document.getElementById('run');

async function run() {
  output.textContent = 'Loading...';
  try {
    const result = await invoke('inspectLicense');
    output.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    output.textContent = JSON.stringify({
      ok: false,
      message: error.message,
      stack: error.stack,
    }, null, 2);
  }
}

button.addEventListener('click', run);
