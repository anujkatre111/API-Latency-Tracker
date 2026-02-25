import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddEndpointForm } from "@/components/endpoints/add-endpoint-form";

export default async function NewEndpointPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Endpoint</h1>
        <p className="text-muted-foreground">
          Configure a new API endpoint to monitor
        </p>
      </div>
      <AddEndpointForm />
    </div>
  );
}
