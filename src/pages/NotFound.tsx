import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page panel">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>There is no page at this address.</p>
      <Link className="back-link" to="/todos">Go to todos</Link>
    </section>
  )
}
