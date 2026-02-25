import { useRef, useCallback, useEffect } from 'react';

type UseScrollRevealOptions = {
  threshold?: number;
  disabled?: boolean;
};

/**
 * Returns a ref callback that observes elements via IntersectionObserver.
 * When an element enters the viewport, it gets `data-revealed="true"`.
 * Each element is unobserved after first reveal — zero ongoing cost.
 * When disabled (e.g. reducedMotion), elements are revealed immediately.
 */
export function useScrollReveal({
  threshold = 0.15,
  disabled = false,
}: UseScrollRevealOptions = {}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<HTMLElement>>(new Set());

  // Create observer lazily
  useEffect(() => {
    if (disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.dataset.revealed = 'true';
            observer.unobserve(el);
            elementsRef.current.delete(el);
          }
        }
      },
      { threshold },
    );

    observerRef.current = observer;

    // Observe any elements that were registered before the observer was created
    for (const el of elementsRef.current) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [threshold, disabled]);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;

      if (disabled) {
        // Immediately reveal — no animation
        el.dataset.revealed = 'true';
        return;
      }

      elementsRef.current.add(el);

      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    },
    [disabled],
  );

  return ref;
}
