"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/action/mutation/auth";
import { Button } from "@/components/ui/button";

interface FormState {
  error?: string;
}

const REMEMBER_KEY = "admin-login-remember";

export function AdminLoginForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({});
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { email?: string };
      if (parsed.email) {
        setEmail(parsed.email);
        setRememberMe(true);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistRememberedEmail = (shouldRemember: boolean, value: string) => {
    if (shouldRemember) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: value }));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setState({ error: "Email and password are required." });
      return;
    }

    setState({});

    startTransition(async () => {
      try {
        const result = await signIn(trimmedEmail, trimmedPassword);
        if (!result.success) {
          setState({ error: result.message });
          return;
        }
        persistRememberedEmail(rememberMe, trimmedEmail);
        router.replace("/admin");
        router.refresh();
        setPassword("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to process the request.";
        setState({ error: message });
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Administrator access</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
            className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            autoComplete="email"
            disabled={isPending}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter passphrase"
            className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            autoComplete="current-password"
            disabled={isPending}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border/70 text-primary accent-primary"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={isPending}
          />
          Remember me on this device
        </label>

        {state.error ? (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        ) : null}
        <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
          {isPending ? "Checking credentials…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
