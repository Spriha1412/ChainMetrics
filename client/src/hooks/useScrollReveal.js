import { useEffect, useRef, useCallback } from "react";

/**
 * Scroll-reveal hook — adds 'visible' to elements entering the viewport.
 * Supports both .reveal (translateY) and .reveal-scale (scale).
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("visible");
                    observer.unobserve(el);
                }
            },
            { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? "0px 0px -40px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}

/**
 * Scroll-reveal for parent with staggered children.
 * Adds 'visible' to all children that have .reveal class.
 */
export function useScrollRevealChildren(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    container.querySelectorAll(".reveal, .reveal-scale").forEach((child) => {
                        child.classList.add("visible");
                    });
                    observer.unobserve(container);
                }
            },
            { threshold: options.threshold ?? 0.08, rootMargin: options.rootMargin ?? "0px 0px -30px 0px" }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return ref;
}

/**
 * Hook for sticky navbar blur effect — adds/removes 'scrolled' class.
 */
export function useScrolledNavbar(threshold = 30) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handler = () => {
            if (window.scrollY > threshold) {
                el.classList.add("scrolled");
            } else {
                el.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handler, { passive: true });
        handler(); // initial
        return () => window.removeEventListener("scroll", handler);
    }, [threshold]);

    return ref;
}
