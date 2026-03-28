import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HomeContent from "./HomeContent";

interface UserProfile {
  id: string;
  full_name: string | null;
  rhu_station: string | null;
}

export default async function Home() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, rhu_station")
      .eq("id", user.id)
      .single();

    if (profileData) {
      profile = profileData as UserProfile;
    }
  }

  return (
    <HomeContent profile={profile} isAuthenticated={!!user} />
  );
}
