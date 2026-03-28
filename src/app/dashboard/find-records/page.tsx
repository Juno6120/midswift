import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FindRecordsContent from "./FindRecordsContent";
import LoaderStopper from "@/src/components/ui/LoaderStopper";

interface Report {
  id: string;
  report_type: string;
  report_month: string;
  report_year: number;
  status: string;
}

export default async function FindRecordsPage() {
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

  if (!user) {
    redirect("/login");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("id, report_type, report_month, report_year, status")
    .eq("midwife_id", user.id)
    .order("report_year", { ascending: false })
    .order("report_month", { ascending: true });

  return (
    <>
      <LoaderStopper />
      <FindRecordsContent reports={(reports as Report[]) || []} />
    </>
  );
}
