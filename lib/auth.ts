import { auth } from "@clerk/nextjs/server";
import connectDB from "./db";
import User from "@/models/User";

/**
 * Gets the current user's Clerk ID.
 * Returns null if not authenticated.
 */
export async function getClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Gets the current user's database record.
 * Connects to DB and fetches the user based on Clerk ID.
 */
export async function getCurrentUser() {
  const clerkId = await getClerkId();
  if (!clerkId) return null;

  await connectDB();
  const user = await User.findOne({ clerkId });
  return user;
}

/**
 * Gets the current user or throws a 401-style error.
 * Use in API routes where auth is required.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Checks if the user has completed onboarding.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.onboardingCompleted;
}
