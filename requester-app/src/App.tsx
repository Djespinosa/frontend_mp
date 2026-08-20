import { Routes, Route } from 'react-router-dom';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestListPage } from './pages/RequestListPage';
import { RequestDetailPage } from './pages/RequestDetailPage';

/**
 * Componente expuesto vía Module Federation ('./RequesterApp'). Agnóstico de
 * router: no incluye <BrowserRouter> propio, para poder montarse tanto
 * dentro del host (que ya provee el Router) como en el bootstrap standalone.
 */
export function RequesterApp() {
  return (
    <Routes>
      <Route index element={<RequestListPage />} />
      <Route path="new" element={<CreateRequestPage />} />
      <Route path=":id" element={<RequestDetailPage />} />
    </Routes>
  );
}
