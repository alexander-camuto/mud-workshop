import { useQuery } from "@tanstack/react-query";
import { getClients } from "./client";

export function useClients() {
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => {
      return getClients();
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return clients;
}
