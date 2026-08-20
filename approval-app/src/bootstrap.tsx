import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApprovalApp } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el elemento #root en el HTML');
}

// Desarrollo aislado: http://localhost:3002/?solicitud_id=...&approver_token=...
ReactDOM.render(
  <BrowserRouter>
    <ApprovalApp />
  </BrowserRouter>,
  container
);
