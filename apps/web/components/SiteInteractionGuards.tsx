'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type ScrollPosition = { x: number; y: number };

const STORAGE_PREFIX = 'al-waha-scroll:';
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

function currentLocationKey() {
  const search = new URLSearchParams(window.location.search).toString();
  return `${window.location.pathname}${search ? `?${search}` : ''}`;
}

function saveCurrentScrollPosition() {
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${currentLocationKey()}`,
      JSON.stringify({ x: window.scrollX, y: window.scrollY }),
    );
  } catch {
    // Scroll restoration is a convenience; keep navigation working if storage is unavailable.
  }
}

function readScrollPosition(key: string): ScrollPosition | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ScrollPosition>;
    if (typeof value.x !== 'number' || typeof value.y !== 'number') return null;
    return { x: value.x, y: value.y };
  } catch {
    return null;
  }
}

export function SiteInteractionGuards() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const routeKey = `${pathname}${search ? `?${search}` : ''}`;
  const lastRouteKey = useRef(routeKey);
  const popNavigationPending = useRef(false);
  const restoring = useRef(false);
  const cancelRestore = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const savePosition = () => {
      if (!restoring.current) saveCurrentScrollPosition();
    };
    const noteHistoryNavigation = () => {
      popNavigationPending.current = true;
    };
    const preventCopy = (event: ClipboardEvent) => event.preventDefault();
    const isEditableTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR));
    const preventContextMenu = (event: MouseEvent) => {
      if (!isEditableTarget(event.target)) event.preventDefault();
    };
    const preventSelection = (event: Event) => {
      if (!isEditableTarget(event.target)) event.preventDefault();
    };
    const preventImageDrag = (event: DragEvent) => {
      if (event.target instanceof Element && event.target.closest('img')) event.preventDefault();
    };
    const preventCopyShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ['c', 'x'].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    window.addEventListener('scroll', savePosition, { passive: true });
    window.addEventListener('pagehide', savePosition);
    window.addEventListener('popstate', noteHistoryNavigation);
    document.addEventListener('copy', preventCopy, true);
    document.addEventListener('cut', preventCopy, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('selectstart', preventSelection, true);
    document.addEventListener('dragstart', preventImageDrag, true);
    document.addEventListener('keydown', preventCopyShortcut, true);
    savePosition();

    return () => {
      cancelRestore.current?.();
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener('scroll', savePosition);
      window.removeEventListener('pagehide', savePosition);
      window.removeEventListener('popstate', noteHistoryNavigation);
      document.removeEventListener('copy', preventCopy, true);
      document.removeEventListener('cut', preventCopy, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
      document.removeEventListener('selectstart', preventSelection, true);
      document.removeEventListener('dragstart', preventImageDrag, true);
      document.removeEventListener('keydown', preventCopyShortcut, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (lastRouteKey.current === routeKey) return;
    lastRouteKey.current = routeKey;
    if (!popNavigationPending.current) return;
    popNavigationPending.current = false;

    const position = readScrollPosition(routeKey);
    if (!position) return;

    let stopped = false;
    let userMoved = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    restoring.current = true;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('wheel', cancelForUserInput);
      window.removeEventListener('touchstart', cancelForUserInput);
      window.removeEventListener('pointerdown', cancelForUserInput);
      restoring.current = false;
      cancelRestore.current = null;
      saveCurrentScrollPosition();
    };
    const cancelForUserInput = () => {
      userMoved = true;
      stop();
    };
    const restore = () => {
      if (stopped || userMoved) return;
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const targetY = Math.min(position.y, maxY);
      window.scrollTo(position.x, targetY);

      if (targetY >= position.y - 1 || Date.now() - startedAt >= 5000) {
        stop();
        return;
      }
      timer = setTimeout(restore, 120);
    };

    window.addEventListener('wheel', cancelForUserInput, { passive: true });
    window.addEventListener('touchstart', cancelForUserInput, { passive: true });
    window.addEventListener('pointerdown', cancelForUserInput, { passive: true });
    cancelRestore.current = stop;
    requestAnimationFrame(restore);

    return stop;
  }, [routeKey]);

  return null;
}
