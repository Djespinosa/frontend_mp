import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { RequesterApp } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el elemento #root en el HTML');
}

// Desarrollo aislado (sin el host): rutas simplificadas relativas a "/"
// ("/", "/new", "/:id") en vez de "/requests/*", ya que aquí no hay un
// <Route path="/requests/*"> padre que aporte ese prefijo.
ReactDOM.render(
  <BrowserRouter>
    <RequesterApp />
  </BrowserRouter>,
  container
);
