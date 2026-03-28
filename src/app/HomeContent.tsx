"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoading } from "@/src/context/LoadingContext";
import LoadingScreen from "@/src/components/ui/LoadingScreen";
import DashboardLayoutClient from "@/src/app/dashboard/DashboardLayoutClient";
import FabMenu from "@/src/components/ui/FabMenu";
import ReportBugModal from "@/src/components/modals/ReportBugModal";
import AboutDeveloperModal from "@/src/components/modals/AboutDeveloperModal";
import {
  FilePlus,
  Search,
  ArrowRight,
  CheckCircle2,
  Activity,
  Shield,
  Clock,
  BarChart3,
  Download,
  X,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  rhu_station: string | null;
  [key: string]: any;
}

interface Feature {
  accentColor: string;
  iconColor: string;
  iconActiveColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HomeContentProps {
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

export default function HomeContent({
  profile,
  isAuthenticated,
}: HomeContentProps) {
  return (
    <Suspense>
      <HomeContentInner profile={profile} isAuthenticated={isAuthenticated} />
    </Suspense>
  );
}

function HomeContentInner({ profile, isAuthenticated }: HomeContentProps) {
  const { startLoading } = useLoading();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("welcome") === "new";
  const [isInstalledApp, setIsInstalledApp] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [randomMessage, setRandomMessage] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showAndroidDownloadPrompt, setShowAndroidDownloadPrompt] =
    useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setAnimate(true);

    const welcomeMessages = [
      "Ready to make today amazing",
      "Let's deliver excellence today",
      "Your patients are lucky to have you",
      "Time to thrive",
      "Precision and care",
      "You're unstoppable",
    ];

    setRandomMessage(
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
    );

    return () => {
      setIsNavigating(false);
    };
  }, []);

  useEffect(() => {
    const isStandaloneDisplay =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches;
    const isIosStandalone =
      "standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const isTwaLaunch = document.referrer.startsWith("android-app://");

    setIsInstalledApp(isStandaloneDisplay || isIosStandalone || isTwaLaunch);

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      if (!isStandaloneDisplay && !isIosStandalone && !isTwaLaunch) {
        setShowAndroidDownloadPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleNavigation = () => {
    startLoading();
    setIsNavigating(true);
  };

  const handleFeatureToggle = (index: number) => {
    setExpandedFeature((prev) => (prev === index ? null : index));
  };

  const features: Feature[] = [
    {
      accentColor: "bg-teal-500",
      iconColor: "text-slate-400",
      iconActiveColor: "text-teal-500",
      icon: <Clock className="w-8 h-8" />,
      title: "Instant Sync",
      description:
        "Say goodbye to manual filing. Every record you create is synchronized instantly to your RHU station, ensuring your team is always in the loop.",
    },
    {
      accentColor: "bg-emerald-500",
      iconColor: "text-slate-400",
      iconActiveColor: "text-emerald-500",
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Privacy",
      description:
        "Your patient data is encrypted at rest and in transit. We use Supabase's hardened security layer to keep sensitive info strictly confidential.",
    },
    {
      accentColor: "bg-indigo-500",
      iconColor: "text-slate-400",
      iconActiveColor: "text-indigo-500",
      icon: <Activity className="w-8 h-8" />,
      title: "Growth Metrics",
      description:
        "Visualize your impact. Our analytics engine turns monthly reports into beautiful, easy-to-read charts that help you track community health trends.",
    },
  ];

  return (
    <DashboardLayoutClient profile={profile} isAuthenticated={isAuthenticated}>
      <div className="relative text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px] animate-glass-2" />
          <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-indigo-50/50 rounded-full blur-[100px] animate-glass-3" />
          <div className="absolute inset-0 backdrop-blur-[60px]" />
          <div className="absolute inset-0 bg-grain opacity-[0.15]" />
        </div>

        {isNavigating && (
          <LoadingScreen
            isTimeout={false}
            onClose={() => setIsNavigating(false)}
          />
        )}

        <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
          {!isInstalledApp && showAndroidDownloadPrompt && (
            <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-teal-200 bg-white/70 px-5 py-5 shadow-lg shadow-teal-100/40 backdrop-blur-md sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                  Android App
                </p>
                <p className="text-sm font-medium leading-relaxed text-slate-600">
                  Install MidSwift as the full Android app instead of adding a
                  browser shortcut.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <a
                  href="/downloads/midswift-android.apk"
                  download
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.35rem] bg-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(13,148,136,0.8)] transition-all hover:-translate-y-0.5 hover:bg-teal-700 sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download App
                </a>
                <button
                  type="button"
                  onClick={() => setShowAndroidDownloadPrompt(false)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-[1.35rem] border border-slate-200 bg-white/80 text-slate-500 transition-colors hover:text-slate-700 sm:h-10 sm:min-h-0 sm:w-10"
                  aria-label="Dismiss app download prompt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[70vh]">
            <div className="lg:col-span-3 space-y-10">
              <div
                className={`space-y-4 transform transition-all duration-700 ${
                  animate
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight wrap-break-word text-slate-900">
                  {isAuthenticated ? (
                    <>
                      {isNewUser ? "Welcome," : "Welcome back,"}{" "}
                      <span className="bg-linear-to-r from-teal-600 via-emerald-500 to-teal-700 bg-clip-text text-transparent animate-pulse break-all inline-block py-1">
                        {profile?.full_name?.split(" ")[0] || " "}
                      </span>
                    </>
                  ) : (
                    <>
                      RHU Health reporting,{" "}
                      <span className="bg-linear-to-r from-teal-600 via-emerald-500 to-teal-700 bg-clip-text text-transparent break-all inline-block py-1">
                        simplified.
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed min-h-8">
                  {isAuthenticated
                    ? randomMessage
                      ? `${randomMessage}.`
                      : ""
                    : "Streamline your RHU reports so you can focus on what matters -- patient care."}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  onClick={isAuthenticated ? handleNavigation : undefined}
                  className="inline-flex items-center justify-center gap-4 rounded-[2rem] bg-teal-600 px-10 py-6 text-xl font-bold text-white shadow-[0_10px_20px_-5px_rgba(13,148,136,0.3)] transition-all active:scale-95 group hover:-translate-y-1 hover:bg-teal-700 hover:shadow-2xl"
                >
                  {isAuthenticated ? "Go to my Dashboard" : "Get Started"}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>

                {!isInstalledApp && (
                  <a
                    href="/downloads/midswift-android.apk"
                    download
                    className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[1.75rem] border border-teal-200 bg-white/90 px-6 py-4 text-base font-bold text-teal-700 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:border-teal-300 hover:bg-white sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
                  >
                    <Download className="h-5 w-5" />
                    <span className="text-center leading-tight">
                      Download App
                    </span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  Easy to use
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  Secure, real-time access from any web connection.
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
                <div className="bg-white/50 border border-white/40 rounded-[2rem] p-8 space-y-6">
                  <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs">
                    Quick Menu
                  </h3>

                  <div className="grid gap-3">
                    <Link
                      href={
                        isAuthenticated
                          ? "/dashboard?action=new-report"
                          : "/login"
                      }
                      onClick={isAuthenticated ? handleNavigation : undefined}
                      className="flex items-center gap-4 p-4 bg-white/60 border border-white/80 rounded-2xl hover:border-teal-400 hover:bg-white/90 transition-all group"
                    >
                      <div className="w-12 h-12 bg-teal-50/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FilePlus className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">New Report</p>
                        <p className="text-xs text-slate-500">
                          Start a monthly entry
                        </p>
                      </div>
                    </Link>

                    <Link
                      href={
                        isAuthenticated ? "/dashboard/find-records" : "/login"
                      }
                      onClick={isAuthenticated ? handleNavigation : undefined}
                      className="flex items-center gap-4 p-4 bg-white/60 border border-white/80 rounded-2xl hover:border-teal-400 hover:bg-white/90 transition-all"
                    >
                      <div className="w-12 h-12 bg-indigo-50/50 rounded-xl flex items-center justify-center">
                        <Search className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Find Records</p>
                        <p className="text-xs text-slate-500">
                          Search & filter all reports
                        </p>
                      </div>
                    </Link>

                    <Link
                      href={isAuthenticated ? "/dashboard/analytics" : "/login"}
                      onClick={isAuthenticated ? handleNavigation : undefined}
                      className="flex items-center gap-4 p-4 bg-white/60 border border-white/80 rounded-2xl hover:border-teal-400 hover:bg-white/90 transition-all"
                    >
                      <div className="w-12 h-12 bg-violet-50/50 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Analytics</p>
                        <p className="text-xs text-slate-500">
                          Visualize your report data
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-32 space-y-32">
            <div className="grid md:grid-cols-2 gap-12 items-end">
              <div>
                <span className="text-teal-600 font-bold tracking-widest uppercase text-xs">
                  MidSwift Mindset
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-4 leading-[1.1]">
                  Where clinical care meets <br />
                  <span className="italic font-serif text-teal-700/80">
                    digital precision.
                  </span>
                </h2>
              </div>
              <p className="text-lg text-slate-500 font-medium leading-relaxed pb-2">
                Reporting shouldn't take time away from your patients. MidSwift
                is built to be an invisible assistant -- handling the data so
                you can handle the care.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-16">
              {features.map((feature, index) => {
                const isExpanded = expandedFeature === index;
                return (
                  <div
                    key={index}
                    onClick={() => handleFeatureToggle(index)}
                    className="group space-y-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-1 rounded-full transition-all duration-500 ${feature.accentColor} ${
                          isExpanded ? "h-14" : "h-10 group-hover:h-14"
                        }`}
                      />
                      <span
                        className={`transition-colors duration-300 ${
                          isExpanded
                            ? feature.iconActiveColor
                            : `${feature.iconColor} group-hover:${feature.iconActiveColor}`
                        }`}
                      >
                        {feature.icon}
                      </span>
                    </div>

                    <h4
                      className={`text-2xl font-bold text-slate-800 transition-transform duration-300 ${
                        isExpanded
                          ? "translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                    >
                      {feature.title}
                    </h4>

                    <div
                      className={`grid transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr] group-hover:grid-rows-[1fr]"
                      }`}
                    >
                      <p
                        className={`text-slate-500 leading-relaxed font-medium overflow-hidden transition-all duration-500 transform ${
                          isExpanded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <FabMenu
          onReportBug={() => setIsBugModalOpen(true)}
          onAbout={() => setIsAboutModalOpen(true)}
        />

        <footer className="relative z-10 w-full bg-white/40 backdrop-blur-md py-12 border-t border-slate-100/50 px-6 mt-20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-center gap-8">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <p>© {currentYear} MidSwift</p>
            </div>
          </div>
        </footer>

        <ReportBugModal
          isOpen={isBugModalOpen}
          onClose={() => setIsBugModalOpen(false)}
        />
        <AboutDeveloperModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />
      </div>
    </DashboardLayoutClient>
  );
}
