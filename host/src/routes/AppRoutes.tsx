import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingIndicator } from '@mp/shared';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { MockMailPage } from '../pages/dev/MockMailPage';

const RequesterAppRemote = lazy(() =>
  import('requesterApp/RequesterApp').then((module) => ({ default: module.RequesterApp }))
);
const ApprovalAppRemote = lazy(() =>
  import('approvalApp/ApprovalApp').then((module) => ({ default: module.ApprovalApp }))
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingIndicator label="Cargando módulo..." />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/requests/*" element={<RequesterAppRemote />} />
        <Route path="/approve/*" element={<ApprovalAppRemote />} />
        <Route path="/dev/mock-mail" element={<MockMailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
