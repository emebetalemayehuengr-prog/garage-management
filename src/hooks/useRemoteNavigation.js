import { useEffect } from 'react';

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisible = (element) => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return (
    rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  );
};

const center = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

const findNext = (current, direction) => {
  const currentRect = current.getBoundingClientRect();
  const origin = center(currentRect);

  return Array.from(document.querySelectorAll(FOCUSABLE))
    .filter((element) => element !== current && isVisible(element))
    .map((element) => {
      const target = center(element.getBoundingClientRect());
      const dx = target.x - origin.x;
      const dy = target.y - origin.y;
      const primary =
        direction === 'left' ? -dx : direction === 'right' ? dx : direction === 'up' ? -dy : dy;
      const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      return { element, primary, score: primary + secondary * 2.5 };
    })
    .filter(({ primary }) => primary > 4)
    .sort((a, b) => a.score - b.score)[0]?.element;
};

export const useRemoteNavigation = () => {
  useEffect(() => {
    document.documentElement.classList.add('remote-ready');

    const handleKeyDown = (event) => {
      // Samsung Smart Remote Back/Return key. At the app root the expected TV
      // behavior is to close the application rather than leave a blank page.
      if (event.keyCode === 10009 || event.key === 'GoBack') {
        event.preventDefault();
        try {
          window.tizen?.application?.getCurrentApplication()?.exit();
        } catch {
          // Normal web browsers do not expose the Tizen application API.
        }
        return;
      }

      const directions = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      const direction = directions[event.key];
      if (!direction) return;

      const active = document.activeElement;
      const editable = active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);
      if (editable && (direction === 'left' || direction === 'right')) return;

      const focusable = Array.from(document.querySelectorAll(FOCUSABLE)).filter(isVisible);
      const target =
        active && active !== document.body ? findNext(active, direction) : focusable[0];
      if (!target) return;

      event.preventDefault();
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.classList.remove('remote-ready');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
