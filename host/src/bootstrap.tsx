import ReactDOM from 'react-dom';
import { App } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el elemento #root en el HTML');
}

ReactDOM.render(<App />, container);
