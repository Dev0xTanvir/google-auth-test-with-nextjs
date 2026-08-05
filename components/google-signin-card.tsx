"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Loader2, ClipboardCopy, ShieldCheck } from "lucide-react";

import { verifyGoogleIdToken } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              shape?: "rectangular" | "pill" | "circle" | "square";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
            },
          ) => void;
        };
      };
    };
  }
}

const initialActionState = { status: "idle" as const };

function CopyableField({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">{label}</Label>
        <Button type="button" variant="ghost" size="xs" onClick={copy}>
          <ClipboardCopy /> Copy
        </Button>
      </div>
      <Textarea
        readOnly
        value={value}
        className="max-h-24 font-mono text-xs text-sky-600 dark:text-sky-400"
      />
    </div>
  );
}

export function GoogleSignInCard({ clientId }: { clientId: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [idToken, setIdToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [state, formAction, isPending] = useActionState(
    verifyGoogleIdToken,
    initialActionState,
  );

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        setIdToken(response.credential);
        toast.success("Google ID token generated!");
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      size: "large",
    });
  }, [scriptReady, clientId]);

  const copyIdToken = async () => {
    if (!idToken) {
      toast.error("Sign in with Google first to generate a token.");
      return;
    }
    await navigator.clipboard.writeText(idToken);
    toast.success("Token copied to clipboard!");
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border p-6">
        <div ref={buttonRef} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tokenBox">Generated ID Token</Label>
          <span className="text-xs font-medium text-muted-foreground">
            {idToken ? "Token generated successfully!" : "Waiting for sign-in..."}
          </span>
        </div>
        <Textarea
          id="tokenBox"
          readOnly
          value={idToken}
          placeholder="Sign in with Google above to generate a token..."
          className="min-h-32 font-mono text-xs text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" onClick={copyIdToken}>
          <ClipboardCopy /> Copy Token
        </Button>
      </div>

      <Separator />

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="idToken" value={idToken} readOnly />
        <Button type="submit" disabled={!idToken || isPending} className="self-end">
          {isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Verify with Backend
        </Button>

        {state.status === "success" && (
          <div className="flex flex-col gap-4">
            <Alert>
              <ShieldCheck />
              <AlertTitle>{state.data.message}</AlertTitle>
              <AlertDescription>
                Signed in as {state.data.user.name} ({state.data.user.email}) &middot;{" "}
                <Badge variant="secondary">{state.data.user.role}</Badge>
              </AlertDescription>
            </Alert>
            <CopyableField label="Access Token" value={state.data.accessToken} />
            <CopyableField label="Refresh Token" value={state.data.refreshToken} />
          </div>
        )}

        {state.status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Backend verification failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </form>
    </>
  );
}
