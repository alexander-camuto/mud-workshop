import { useQuery } from "@tanstack/react-query";
import { getChains } from "./chain";

export function useChains() {
  const { data: chains } = useQuery({
    queryKey: ["chains"],
    queryFn: () => {
      return getChains();
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return chains;
}
