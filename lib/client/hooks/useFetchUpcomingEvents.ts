import { useQuery } from "@tanstack/react-query";
import { auth } from "@/firebase/client"; // your client-side Firebase app

export function useFetchUpcomingEvents() {
  return useQuery({
    queryKey: ["upcoming-events", auth.currentUser?.uid],
    enabled: !!auth.currentUser, // wait until user is known
    queryFn: async () => {
      const get = async (forceRefresh = false) => {
        const token = await auth.currentUser!.getIdToken(forceRefresh);
        const r = await fetch("/api/upcoming-events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        return r;
      };

      // try with cached token first
      let r = await get(false);
      // if unauthorized, force-refresh the token and retry once
      if (r.status === 401) r = await get(true);

      if (!r.ok) throw new Error(await r.text());
      return (await r.json()).week_analysis as string;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
