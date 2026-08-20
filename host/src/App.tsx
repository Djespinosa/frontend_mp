import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}
