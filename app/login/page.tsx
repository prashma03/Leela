"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, name, email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to continue.");
      window.location.href = "/";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  }

  async function startDemo() {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" }),
      });
      if (!response.ok) throw new Error("Unable to open the demo.");
      window.location.href = "/";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to open the demo.");
      setBusy(false);
    }
  }

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
        <p>{mode === "login" ? "Continue your journey" : "Begin your journey"}</p>
        <h2 id="login-title">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                name="name"
                placeholder="Little friend"
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              name="password"
              placeholder="At least 8 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        {status && <strong className="login-status">{status}</strong>}
        <button className="entry-signin" type="button" disabled={busy} onClick={startDemo}>
          {busy ? "Opening demo..." : "Try demo without a password"}
        </button>
        <small>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </small>
      </section>
    </main>
  );
}
