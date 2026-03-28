import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsContent from "./AnalyticsContent";
import LoaderStopper from "@/src/components/ui/LoaderStopper";

interface Indicator {
  id: string;
  label: string;
  has_gender_split: boolean;
  section_name: string;
}

interface DataEntry {
  report_id: string;
  indicator_id: string;
  value_m: number | null;
  value_f: number | null;
}

interface Report {
  id: string;
  report_type: string;
  report_month: string;
  report_year: number;
}

export default async function AnalyticsPage() {
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

  // Fetch all reports for the user
  const { data: reports } = await supabase
    .from("reports")
    .select("id, report_type, report_month, report_year")
    .eq("midwife_id", user.id)
    .order("report_year", { ascending: false })
    .order("report_month", { ascending: true });

  // Fetch all indicators with their sections
  const { data: rawIndicators } = await supabase
    .from("ref_indicators")
    .select(
      `
      id,
      label,
      has_gender_split,
      ref_sections!inner(name)
    `,
    )
    .order("sort_order");

  const indicators: Indicator[] =
    rawIndicators?.map((ind: any) => ({
      id: ind.id,
      label: ind.label,
      has_gender_split: ind.has_gender_split,
      section_name: ind.ref_sections?.name,
    })) || [];

  // Fetch all data entries for user's reports
  const reportIds = (reports || []).map((r) => r.id);
  let entries: DataEntry[] = [];
  if (reportIds.length > 0) {
    // Supabase .in() has a limit, batch if needed
    const batchSize = 100;
    for (let i = 0; i < reportIds.length; i += batchSize) {
      const batch = reportIds.slice(i, i + batchSize);
      const { data } = await supabase
        .from("data_entries")
        .select("report_id, indicator_id, value_m, value_f")
        .in("report_id", batch);
      if (data) entries = entries.concat(data as DataEntry[]);
    }
  }

  return (
    <>
      <LoaderStopper />
      <AnalyticsContent
        reports={(reports as Report[]) || []}
        indicators={indicators}
        entries={entries}
      />
    </>
  );
}
