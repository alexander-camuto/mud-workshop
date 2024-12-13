export interface Region {
  name: string;
  rpcUrls: [string, string];
  explorerUrls: [string?, string?];
}

const FASTEST_REGION_KEY = "fastest-region";

async function checkLatency(url: string): Promise<number> {
  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "net_version",
        params: [],
        id: 1,
      }),
    });
    if (!response.ok) throw new Error("RPC request failed");
    return performance.now() - start;
  } catch (e) {
    return Infinity;
  }
}

async function findFastestRegion(regions: Region[]): Promise<number> {
  const latencies: number[] = [];
  for (const region of regions) {
    const latency = await checkLatency(region.rpcUrls[0]);
    latencies.push(latency);
  }
  console.log({ latencies });

  const fastestIndex = latencies.reduce((fastest, current, index) => {
    return current < (latencies[fastest] || 0) ? index : fastest;
  }, 0);

  // Store result with timestamp
  localStorage.setItem(
    FASTEST_REGION_KEY,
    JSON.stringify({
      index: fastestIndex,
    }),
  );

  return fastestIndex;
}

export async function getFastestRegion(): Promise<Region> {
  const regions = getRegions();
  if (regions.length === 0) {
    throw new Error("No regions available!");
  }

  // Check cached result
  const cached = localStorage.getItem(FASTEST_REGION_KEY);
  if (cached) {
    const { index } = JSON.parse(cached);
    const region = regions[index];
    if (region) {
      return region;
    }
  }

  console.warn("Region cache miss");

  // Find new fastest region
  const fastestIndex = await findFastestRegion(regions);
  const fastestRegion = regions[fastestIndex];
  if (!fastestRegion) {
    throw new Error("No fastest region!");
  }

  return fastestRegion;
}

export function getRegions(): Region[] {
  const regions: Region[] = [];
  let regionIndex = 0;

  // Keep trying to read regions until we find one that doesn't exist
  while (import.meta.env[`VITE_REGION_${regionIndex}_RPC_URL_1`]) {
    regions.push({
      name: `Region ${regionIndex}`,
      rpcUrls: [
        import.meta.env[`VITE_REGION_${regionIndex}_RPC_URL_1`],
        import.meta.env[`VITE_REGION_${regionIndex}_RPC_URL_2`],
      ],
      explorerUrls: [
        import.meta.env[`VITE_REGION_${regionIndex}_EXPLORER_URL_1`],
        import.meta.env[`VITE_REGION_${regionIndex}_EXPLORER_URL_2`],
      ],
    });
    regionIndex++;
  }

  return regions;
}
