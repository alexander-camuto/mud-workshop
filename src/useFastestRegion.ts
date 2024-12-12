import { useQuery } from "@tanstack/react-query";
import { getFastestRegion } from "./config";

export function useFastestRegion() {
  const { data: region } = useQuery({
    queryKey: ["fastest-region"],
    queryFn: () => getFastestRegion(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return region;
}
