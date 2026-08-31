import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  authenticateAccount,
  clearSession,
  createAccount,
  createSession,
  deleteAccountBySession,
  getAccountBySession,
} from "@/app/lib/account-store";

const sessionCookie = "leela_session";
const demoSession = "leela-demo";
const demoUser = {
  id: "demo",
  name: "Demo visitor",
  email: "demo@leela.app",
  memory: {},
};

async function currentSession() {
  return (await cookies()).get(sessionCookie)?.value;
}

function setSession(response: NextResponse, token: string) {
  response.cookies.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function GET() {
  const token = await currentSession();
  const user = token === demoSession ? demoUser : getAccountBySession(token);
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "login" | "signup" | "demo";
      name?: string;
      email?: string;
      password?: string;
    };

    if (body.mode === "demo") {
      const response = NextResponse.json({ user: demoUser });
      setSession(response, demoSession);
      return response;
    }

    const user =
      body.mode === "signup"
        ? createAccount({
            name: body.name || "",
            email: body.email || "",
            password: body.password || "",
          })
        : authenticateAccount({
            email: body.email || "",
            password: body.password || "",
          });

    const response = NextResponse.json({ user });
    setSession(response, createSession(user.id));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign in." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const token = await currentSession();
  const deleteAccount = new URL(request.url).searchParams.get("deleteAccount") === "true";

  if (deleteAccount) {
    if (!token || token === demoSession) {
      return NextResponse.json(
        { error: "Sign in to a personal account before deleting it." },
        { status: 400 },
      );
    }
    if (!deleteAccountBySession(token)) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
  } else {
    clearSession(token);
  }

  const response = NextResponse.json({ user: null, deleted: deleteAccount });
  response.cookies.delete(sessionCookie);
  return response;
}
