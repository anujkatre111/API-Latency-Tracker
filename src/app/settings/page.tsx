import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span>{" "}
            {session.user.email}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Name:</span>{" "}
            {session.user.name ?? "—"}
          </p>
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">
        Profile editing and password change coming in a future update.
      </p>
    </div>
  );
}
