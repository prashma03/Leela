import "server-only";

export async function timedRoute<T>(name: string, work: () => Promise<T>) {
  const started = Date.now();
  try {
    return await work();
  } finally {
    const elapsed = Date.now() - started;
    if (process.env.LEELA_SERVER_TIMING === "1" || elapsed > 2_000) {
      console.info(`[leela:${name}] ${elapsed}ms`);
    }
  }
}
