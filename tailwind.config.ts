import { Config } from "tailwindcss/types/config";

export default {
  content: ["./**/*.{html,js,jsx,ts,tsx}", "!./node_modules"],
  theme: {
    animation: {
      warp: "warp 200ms ease-in-out infinite",
    },
    keyframes: {
      warp: {
        "0%, 100%": { filter: "brightness(1) hue-rotate(0deg)", opacity: "1" },
        "50%": { filter: "brightness(1.2) hue-rotate(270deg)", opacity: "0.3" },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
