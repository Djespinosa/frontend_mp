import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section>
      <h2>Bienvenido</h2>
      <p>Sistema de gestión de solicitudes de compra con flujo de aprobación.</p>
      <nav>
        <Link to="/requests/new">Crear solicitud</Link>
        <Link to="/requests">Ver mis solicitudes</Link>
      </nav>
    </section>
  );
}
