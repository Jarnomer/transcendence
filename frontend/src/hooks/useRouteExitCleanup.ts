import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteExitCleanup({
  fromPath,
  exceptToPaths = [],
  onCleanup,
  debounceMs = 0,
}: {
  fromPath: string;
  exceptToPaths?: string[];
  onCleanup: () => void;
  debounceMs?: number;
}) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      const prev = prevPathRef.current;
      const next = location.pathname;

      const isLeavingFromPath = prev === fromPath;
      const isGoingToException = exceptToPaths.includes(next);

      if (isLeavingFromPath && !isGoingToException) {
        if (debounceMs > 0) {
          timeoutRef.current = setTimeout(() => {
            onCleanup();
          }, debounceMs);
        } else {
          onCleanup();
        }
      }

      prevPathRef.current = next;
    };
  }, [location, fromPath, exceptToPaths, onCleanup, debounceMs]);

  // Clear timeout if component unmounts or rerenders
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
