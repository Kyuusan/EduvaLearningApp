import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set nilai awal
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Listener untuk perubahan
    const listener = () => setMatches(media.matches);
    
    // Modern way
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}