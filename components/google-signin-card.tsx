"use client";

import { ClipboardCopy, Loader2, ShieldCheck } from "lucide-react";
import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { verifyGoogleIdToken } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const initialActionState = { status: "idle" as const };

const btnClass =
  "h-auto gap-2 rounded-[10px] px-5 py-[0.65rem] text-sm font-semibold shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-px hover:bg-[#4f46e5] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] active:translate-y-0";

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

      <div className="mb-8 flex min-h-[90px] items-center justify-center rounded-[14px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-7 transition-colors duration-200 hover:border-primary/40">
        <div ref={buttonRef} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="tokenBox" className="text-sm font-semibold text-[#d1d5db]">
            Generated ID Token
          </Label>
          <span className="text-xs font-medium text-muted-foreground">
            {idToken ? "Token generated successfully!" : "Waiting for sign-in..."}
          </span>
        </div>
        <Textarea
          id="tokenBox"
          readOnly
          value={idToken}
          placeholder="Sign in with Google above to generate a token..."
          className="field-sizing-fixed h-[140px] resize-y rounded-[12px] bg-[#0d1322] px-4 py-4 font-mono text-[0.825rem] leading-normal text-sky-400 placeholder:text-[#4b5563] focus-visible:border-primary focus-visible:ring-primary/15 dark:bg-[#0d1322] md:text-[0.825rem]"
        />
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Button type="button" onClick={copyIdToken} className={btnClass}>
          <ClipboardCopy /> Copy Token
        </Button>
      </div>

      <Separator className="my-8" />

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="idToken" value={idToken} readOnly />
        <Button
          type="submit"
          disabled={!idToken || isPending}
          className={`self-end ${btnClass}`}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Verify with Backend
        </Button>

        {state.status === "success" && (
          <div className="flex flex-col gap-4">
            <Alert>
              <ShieldCheck />
              <AlertTitle>{state?.data?.message}</AlertTitle>
              <AlertDescription>
                Signed in as {state?.data?.user?.name} ({state?.data?.user?.email}) &middot;{" "}
                <Badge variant="secondary">{state?.data?.user?.role}</Badge>
              </AlertDescription>
            </Alert>
            <CopyableField label="Access Token" value={state?.data?.accessToken} />
            <CopyableField label="Refresh Token" value={state?.data?.refreshToken} />
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
