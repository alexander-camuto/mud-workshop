import "tailwindcss/tailwind.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { Providers } from "./Providers.tsx";
import { getWorldDeploy } from "./getWorldDeploy.ts";

getWorldDeploy().then((worldDeploy) => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers worldDeploy={worldDeploy}>
        <App />
      </Providers>
    </StrictMode>
  );
});
