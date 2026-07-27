import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive py-2 text-sm font-medium text-destructive-foreground shadow-lg animate-slide-down">
      <WifiOff className="h-4 w-4" />
      <span>Kamu sedang offline — progress akan tersimpan saat online kembali</span>
    </div>
  );
}
