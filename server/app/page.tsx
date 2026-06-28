export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 40 }}>
      <h1>Thrifted API</h1>
      <p>The backend is running. Endpoints live under <code>/api</code>.</p>
      <p>
        Health check: <a href="/api">/api</a>
      </p>
    </main>
  );
}
