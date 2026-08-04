import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  await connectDB();

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await User.create({
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
      avatarUrl: image_url || "",
      plan: "free",
      onboardingCompleted: false,
    });

    console.log(`✅ User created: ${id}`);
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await User.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        avatarUrl: image_url || "",
      }
    );

    console.log(`✅ User updated: ${id}`);
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    await User.findOneAndDelete({ clerkId: id });
    console.log(`✅ User deleted: ${id}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
