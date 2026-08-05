import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInCard } from "@/components/google-signin-card";

export default function Home() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <div className="flex flex-1 items-center justify-center bg-[radial-gradient(at_0%_0%,color-mix(in_oklch,var(--primary),transparent_85%)_0px,transparent_50%),radial-gradient(at_100%_100%,color-mix(in_oklch,oklch(0.7_0.15_165),transparent_88%)_0px,transparent_50%)] p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit uppercase tracking-wide">
            Doctor Appointment Auth
          </Badge>
          <CardTitle className="text-2xl">Google ID Token Generator</CardTitle>
          <CardDescription>
            Sign in with Google to generate a signed idToken, then verify it against the
            backend&apos;s <code className="rounded bg-muted px-1.5 py-0.5">POST /api/v1/auth/google</code> endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {clientId ? (
            <GoogleSignInCard clientId={clientId} />
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
