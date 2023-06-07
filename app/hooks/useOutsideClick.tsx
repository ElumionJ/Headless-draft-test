import {useEffect} from 'react';

export default function useOutsideClick(
  ref: React.MutableRefObject<HTMLElement | null>,
  setState: (bool: boolean) => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLButtonElement;
      if (ref.current && !ref.current.contains(target)) {
        setState(false);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
