import { Routes, Route } from 'react-router-dom';
import { ApprovalFlowPage } from './pages/ApprovalFlowPage';

/**
 * Componente expuesto vía Module Federation ('./ApprovalApp'). Agnóstico de
 * router, igual que RequesterApp. ApprovalFlowPage lee solicitud_id/approver_token
 * de la query string, no de segmentos de path, por eso alcanza con una
 * ruta índice.
 */
export function ApprovalApp() {
  return (
    <Routes>
      <Route index element={<ApprovalFlowPage />} />
    </Routes>
  );
}
