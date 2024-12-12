import "tailwindcss/tailwind.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { Providers } from "./Providers.tsx";
import { getWorldDeploy } from "./getWorldDeploy.ts";
import { getFastestRegion } from "./config.ts";

getWorldDeploy().then(async (worldDeploy) => {
  const region = await getFastestRegion();
  console.info(`Using region: ${region.name}`)
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers worldDeploy={worldDeploy}>
        <App />
      </Providers>
    </StrictMode>,
  );
});
