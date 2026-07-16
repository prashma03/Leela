import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-art" aria-hidden="true">
        <div className="login-mark-orbit">
          <Image src="/brand-mark.svg" alt="" width={118} height={118} priority />
        </div>
        <div className="login-glow" />
        <div className="login-stars">
          <i />
          <i />
          <i />
          <i />
        </div>
        <h1>Welcome back.</h1>
        <p>Return to your stories, saved reflections, kindness garden, and Krishna AI conversations.</p>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <Link className="login-home" href="/">
          Back to Leela
        </Link>
        <Image src="/brand-mark.svg" alt="Leela symbol" width={54} height={54} priority />
        <p>Continue your journey</p>
        <h2 id="login-title">Sign in</h2>
        <form>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="••••••••" autoComplete="current-password" />
          </label>
          <button type="button">Login</button>
        </form>
        <small>
          New here? <a href="#">Create an account</a>
        </small>
      </section>
    </main>
  );
}
