import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/**
 * Every IPv4 address of this machine, so a phone on the same Wi-Fi (or hotspot / Tailscale) can open the dev server
 * at http://<ip>:3000. Next blocks dev assets for origins it doesn't know, which leaves the page without JavaScript.
 */
const localIps = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n!.address);

const nextConfig: NextConfig = {
  // Hide the Next.js "N" badge in development; errors still show in the overlay.
  devIndicators: false,
  allowedDevOrigins: [...localIps, "*.local"],
};

export default nextConfig;
