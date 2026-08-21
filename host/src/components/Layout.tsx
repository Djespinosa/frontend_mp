import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header>
        <h1>Michael Page — Aprobación de Compras</h1>
        <nav>
          <Link to="/">Inicio</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>Prueba técnica Fullstack Senior</p>
        <p>
          <Link to="/dev/mock-mail">Mock Mail (demo)</Link>
        </p>
      </footer>
    </div>
  );
}
