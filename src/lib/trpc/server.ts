import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createCaller({ db, user, req: undefined as never });
}
