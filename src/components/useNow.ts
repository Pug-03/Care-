"use client";

import { useEffect, useState } from "react";

/** Current time, refreshed every `ms`, so time-based values (pet stats, cooldowns) stay current on an open screen. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
