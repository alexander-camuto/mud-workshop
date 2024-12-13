import { Config } from "tailwindcss/types/config";

export default {
  content: ["./**/*.{html,js,jsx,ts,tsx}", "!./node_modules"],
  theme: {
    animation: {
      warp: "warp 200ms ease-in-out infinite",
      ping: "ping 500ms cubic-bezier(0, 0, 0.2, 1) infinite",
    },
    keyframes: {
      warp: {
        "0%, 100%": { filter: "brightness(1) hue-rotate(0deg)", opacity: "1" },
        "50%": { filter: "brightness(1.2) hue-rotate(270deg)", opacity: "0.3" },
      },

      ping: {
        "75%, 100%": {
          transform: "scale(2)",
          opacity: "0",
        },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
