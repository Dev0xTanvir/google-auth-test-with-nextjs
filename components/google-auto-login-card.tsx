"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

import { loginWithGoogle } from "@/app/login/actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const initialActionState = { status: "idle" as const };

export function GoogleAutoLoginCard({ clientId }: { clientId: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [state, loginAction, isPending] = useActionState(
    loginWithGoogle,
    initialActionState,
  );

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          toast.error("Google did not return an ID token.");
          return;
        }
        startTransition(() => loginAction(response.credential));
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      size: "large",
    });
  }, [scriptReady, clientId, loginAction]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Logged in! Session cookies have been set.");
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="flex min-h-[90px] items-center justify-center rounded-[14px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-7 transition-colors duration-200 hover:border-primary/40">
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Verifying with backend...
          </div>
        ) : (
          <div ref={buttonRef} />
        )}
      </div>

      {state.status === "success" && (
        <Alert className="mt-8">
          <ShieldCheck />
          <AlertTitle>{state.data.message}</AlertTitle>
          <AlertDescription>
            Signed in as {state.data.user.name} ({state.data.user.email}) &middot;{" "}
            <Badge variant="secondary">{state.data.user.role}</Badge>
            <br />
            Session cookies have been set.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "error" && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
