import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditEndpointForm } from "@/components/endpoints/edit-endpoint-form";

export default async function EditEndpointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const endpoint = await prisma.endpoint.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!endpoint) notFound();

  let headersStr = "";
  if (endpoint.headers) {
    try {
      const h = JSON.parse(endpoint.headers) as Record<string, string>;
      headersStr = Object.entries(h).map(([k, v]) => `${k}: ${v}`).join("\n");
    } catch {
      headersStr = endpoint.headers;
    }
  }
  let bodyStr = "";
  if (endpoint.body) {
    try {
      bodyStr = JSON.stringify(JSON.parse(endpoint.body), null, 2);
    } catch {
      bodyStr = endpoint.body;
    }
  }
  let tagsStr = "";
  if (endpoint.tags) {
    try {
      const t = JSON.parse(endpoint.tags) as string[];
      tagsStr = Array.isArray(t) ? t.join(", ") : "";
    } catch {
      tagsStr = "";
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/endpoints/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Endpoint</h1>
          <p className="text-muted-foreground">{endpoint.name}</p>
        </div>
      </div>
      <EditEndpointForm
        endpoint={{
          ...endpoint,
          headers: headersStr,
          body: bodyStr,
          tags: tagsStr,
        }}
      />
    </div>
  );
}
