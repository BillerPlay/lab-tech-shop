"use client";

import { createContext, useContext, useState, useEffect } from "react";

const PremiumContext = createContext({
  isPremium: false,
  plan: null,           // "monthly" | "lifetime" | null
  setPremium: () => {},
  clearPremium: () => {},
});

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (getCookie("isPremium") === "true") {
      setIsPremium(true);
      setPlan(getCookie("premiumPlan")); // "monthly" or "lifetime"
    }
  }, []);

  function setPremium(selectedPlan) {
    writeCookie("isPremium", "true");
    writeCookie("premiumPlan", selectedPlan);
    setIsPremium(true);
    setPlan(selectedPlan);
  }

  function clearPremium() {
    deleteCookie("isPremium");
    deleteCookie("premiumPlan");
    setIsPremium(false);
    setPlan(null);
  }

  return (
    <PremiumContext.Provider value={{ isPremium, plan, setPremium, clearPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}