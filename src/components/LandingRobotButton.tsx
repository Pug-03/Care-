"use client";

import { useEffect, useState } from "react";
import { RobotButton } from "./Logo";

/** The floating robot joins the landing once the visitor has scrolled past the hero, so it never sits on the chart. */
export function LandingRobotButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`transition duration-500 ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} aria-hidden={!show}>
      <RobotButton />
    </div>
  );
}
