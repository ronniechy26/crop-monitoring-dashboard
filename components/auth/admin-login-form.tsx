"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/action/mutation/auth";
import { Button } from "@/components/ui/button";

interface FormState {
  error?: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!email || !password) {
      setState({ error: "Email and password are required." });
      return;
    }

    setState({});

    startTransition(async () => {
      try {
        const result = await signIn(email, password);
        if (!result.success) {
          setState({ error: result.message });
          return;
        }
        router.replace("/admin");
        router.refresh();
        event.currentTarget.reset();
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
            autoComplete="off"
            disabled={isPending}
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
            autoComplete="off"
            disabled={isPending}
          />
        </div>

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
