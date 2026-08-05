import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleAutoLoginCard } from "@/components/google-auto-login-card";

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <div className="flex flex-1 items-center justify-center bg-[radial-gradient(at_0%_0%,rgba(99,102,241,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(16,185,129,0.12)_0px,transparent_50%)] p-6">
      <Card className="w-full max-w-160 gap-8 rounded-[20px] border border-white/8 ring-0 bg-card [--card-spacing:--spacing(10)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_30px_0_rgba(99,102,241,0.25)] backdrop-blur-lg">
        <CardHeader className="gap-0">
          <Badge
            variant="outline"
            className="mb-4 h-auto w-fit gap-2 rounded-full border-primary/30 bg-primary/12 px-3 py-[0.35rem] text-xs font-semibold uppercase tracking-wider text-[#818cf8]"
          >
            <span className="size-1.5 rounded-full bg-[#818cf8] shadow-[0_0_8px_#818cf8]" />
            Doctor Appointment Auth
          </Badge>
          <CardTitle className="mb-2 text-[1.75rem] font-bold leading-snug tracking-tight text-white">
            Sign in with Google
          </CardTitle>
          <CardDescription className="text-[0.925rem] leading-normal text-muted-foreground">
            Signing in verifies your Google ID token against the backend&apos;s{" "}
            <code className="rounded-[6px] bg-white/8 px-[0.4rem] py-[0.15rem] font-mono text-[0.85em] text-[#e0e7ff]">
              POST /api/v1/auth/google
            </code>{" "}
            automatically and stores your session in secure cookies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {clientId ? (
            <GoogleAutoLoginCard clientId={clientId} />
          ) : (
            <p className="text-sm text-destructive">
              Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
