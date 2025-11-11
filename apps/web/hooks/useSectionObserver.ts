"use client";

import { useCallback, useEffect, useState } from "react";

export function useSectionObserver(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "overview");

  useEffect(() => {
    if (!sectionIds.length) return;
    setActiveId((current) => (sectionIds.includes(current) ? current : sectionIds[0] ?? current));
  }, [sectionIds]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id) {
            setActiveId((current) => (current === id ? current : id));
          }
        }
      },
      {
        threshold: [0.3, 0.6],
        rootMargin: "-20% 0px -40% 0px",
      },
    );

    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = useCallback((id: string) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return { activeId, scrollToSection };
}
