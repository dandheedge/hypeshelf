import { Webhook } from "svix";
import { headers } from "next/headers";
import { convex } from "@/convex/_generated/server";
import { api } from "@/convex/_generated";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  // Get headers
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create webhook and verify
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  const { type } = evt;
  const { data } = evt;

  try {
    switch (type) {
      case "user.created":
      case "user.updated":
        await convex.mutation.users.upsertFromClerk({
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.username || "User",
          imageUrl: data.image_url,
        });
        break;
      case "user.deleted":
        await convex.mutation.users.deleteUser({
          clerkId: data.id,
        });
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 500 });
  }

  return Response.json({ success: true });
}
