"use client";

import LoadingScreen from "@/src/components/ui/LoadingScreen";

export default function RouteLoadingScreen(): React.JSX.Element {
  return <LoadingScreen isTimeout={false} onClose={() => {}} />;
}
