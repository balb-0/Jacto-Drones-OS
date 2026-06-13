'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { FlightTelemetryPoint } from '../types/flight-telemetry';

const SLIDING_WINDOW_SIZE = 200;
const MAX_FRAME_GAP_MS = 200;

type PlaybackState = 'idle' | 'playing' | 'stopped';

export interface UseFlightReplayReturn {
  isPlaying: boolean;
  currentIndex: number;
  currentTime: number;
  visibleData: FlightTelemetryPoint[];
  start: () => void;
  stop: () => void;
  reset: () => void;
  isComplete: boolean;
}

/**
 * Flight replay playback engine hook.
 *
 * State machine: idle → playing → stopped → idle, with stopped → playing (restart).
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Exposes a sliding window of the last 200 telemetry points for chart rendering.
 */
export function useFlightReplay(data: FlightTelemetryPoint[]): UseFlightReplayReturn {
  const [state, setState] = useState<PlaybackState>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const elapsedSimRef = useRef(0);
  const isPlayingRef = useRef(false);

  const totalDuration = useMemo(
    () => (data.length === 0 ? 0 : data[data.length - 1].sim_time_s),
    [data],
  );

  const findIndexForTime = useCallback(
    (time: number): number => {
      if (data.length === 0) return 0;
      if (time <= data[0].sim_time_s) return 0;
      if (time >= data[data.length - 1].sim_time_s) return data.length - 1;

      let lo = 0;
      let hi = data.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (data[mid].sim_time_s <= time) lo = mid + 1;
        else hi = mid - 1;
      }
      return hi;
    },
    [data],
  );

  const visibleData = useMemo(() => {
    const start = Math.max(0, currentIndex - SLIDING_WINDOW_SIZE + 1);
    return data.slice(start, currentIndex + 1);
  }, [data, currentIndex]);

  const cancelAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const animate = useCallback(
    (now: number) => {
      if (!isPlayingRef.current) return;

      // Detect tab backgrounding: if delta since last frame is abnormally large,
      // shift the start reference forward so we don't count backgrounded time.
      const frameDelta = now - lastFrameTimeRef.current;
      if (frameDelta > MAX_FRAME_GAP_MS && lastFrameTimeRef.current !== 0) {
        startTimeRef.current += frameDelta;
      }
      lastFrameTimeRef.current = now;

      const elapsedSec = elapsedSimRef.current + (now - startTimeRef.current) / 1000;

      if (elapsedSec >= totalDuration) {
        const lastIndex = data.length - 1;
        setCurrentIndex(lastIndex);
        setCurrentTime(data[lastIndex].sim_time_s);
        setIsComplete(true);
        setState('stopped');
        isPlayingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const idx = findIndexForTime(elapsedSec);
      setCurrentIndex(idx);
      setCurrentTime(elapsedSec);

      rafIdRef.current = requestAnimationFrame(animate);
    },
    [data, totalDuration, findIndexForTime],
  );

  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    if (state === 'stopped' || isComplete) {
      elapsedSimRef.current = 0;
      setCurrentIndex(0);
      setCurrentTime(0);
      setIsComplete(false);
    }

    isPlayingRef.current = true;
    setState('playing');

    const now = performance.now();
    startTimeRef.current = now;
    lastFrameTimeRef.current = now;
    rafIdRef.current = requestAnimationFrame(animate);
  }, [state, isComplete, animate]);

  const stop = useCallback(() => {
    if (!isPlayingRef.current) return;

    elapsedSimRef.current += (performance.now() - startTimeRef.current) / 1000;
    cancelAnimation();
    isPlayingRef.current = false;
    setState('stopped');
  }, [cancelAnimation]);

  const reset = useCallback(() => {
    cancelAnimation();
    isPlayingRef.current = false;
    elapsedSimRef.current = 0;
    lastFrameTimeRef.current = 0;
    setCurrentIndex(0);
    setCurrentTime(0);
    setIsComplete(false);
    setState('idle');
  }, [cancelAnimation]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying: state === 'playing',
    currentIndex,
    currentTime,
    visibleData,
    start,
    stop,
    reset,
    isComplete,
  };
}
