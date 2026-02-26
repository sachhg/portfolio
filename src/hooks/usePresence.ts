import { useRef, useState, useCallback, useEffect } from 'react';
import PartySocket from 'partysocket';

export type Visitor = {
  id: string;
  x: number;
  y: number;
  color: string;
  number: number;
};

export type Ping = {
  id: number;
  x: number;
  y: number;
  color: string;
  createdAt: number;
};

type PresenceReturn = {
  visitors: Visitor[];
  visitorCount: number;
  pings: Ping[];
  reportPosition: (x: number, y: number) => void;
  sendPing: (x: number, y: number) => void;
  connected: boolean;
};

const noop = () => {};
const EMPTY: Visitor[] = [];
const EMPTY_PINGS: Ping[] = [];

export function usePresence(): PresenceReturn {
  const host = import.meta.env.VITE_PARTYKIT_HOST || '';
  const enabled = host.length > 0;

  const wsRef = useRef<PartySocket | null>(null);
  const visitorsMapRef = useRef(new Map<string, Visitor>());
  const [visitors, setVisitors] = useState<Visitor[]>(EMPTY);
  const [visitorCount, setVisitorCount] = useState(0);
  const [pings, setPings] = useState<Ping[]>(EMPTY_PINGS);
  const [connected, setConnected] = useState(false);
  const pingIdRef = useRef(0);

  // Throttle state for reportPosition
  const lastSentRef = useRef(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const throttleTimerRef = useRef(0);

  // Ping cooldown
  const lastPingRef = useRef(0);

  // Flush visitors from map → array on interval
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const arr = Array.from(visitorsMapRef.current.values());
      setVisitors(arr);
      setVisitorCount(arr.length);
    }, 100);
    return () => clearInterval(interval);
  }, [enabled]);

  // Clean up expired pings
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setPings(prev => {
        const now = Date.now();
        const filtered = prev.filter(p => now - p.createdAt < 800);
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [enabled]);

  // WebSocket connection
  useEffect(() => {
    if (!enabled) return;

    const ws = new PartySocket({
      host,
      room: 'portfolio',
    });

    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setConnected(true);
      // Send buffered position if we have one (from before socket was ready)
      if (pendingRef.current) {
        const pos = pendingRef.current;
        pendingRef.current = null;
        ws.send(JSON.stringify({ type: 'position', x: pos.x, y: pos.y }));
        lastSentRef.current = Date.now();
      }
    });
    ws.addEventListener('error', (e) => {
      console.log('[presence] ws error', e);
    });
    ws.addEventListener('close', () => setConnected(false));

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'sync') {
          visitorsMapRef.current.clear();
          for (const v of data.visitors) {
            visitorsMapRef.current.set(v.id, v);
          }
        }

        if (data.type === 'update') {
          console.log('[presence] recv update', data.visitor.id, 'pos:', data.visitor.x?.toFixed(0), data.visitor.y?.toFixed(0));
          visitorsMapRef.current.set(data.visitor.id, data.visitor);
        }

        if (data.type === 'leave') {
          visitorsMapRef.current.delete(data.id);
        }

        if (data.type === 'ping') {
          const id = ++pingIdRef.current;
          setPings(prev => [...prev, {
            id,
            x: data.x,
            y: data.y,
            color: data.color,
            createdAt: Date.now(),
          }]);
        }
      } catch {
        // Malformed message — ignore
      }
    });

    return () => {
      ws.close();
      wsRef.current = null;
      visitorsMapRef.current.clear();
      setConnected(false);
      window.clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = 0;
    };
  }, [host, enabled]);

  const reportPosition = useCallback((x: number, y: number) => {
    if (!enabled) return;
    pendingRef.current = { x, y };
    if (throttleTimerRef.current) return;

    const now = Date.now();
    const wait = Math.max(0, 200 - (now - lastSentRef.current));

    throttleTimerRef.current = window.setTimeout(() => {
      throttleTimerRef.current = 0;
      if (!pendingRef.current || !wsRef.current) return;
      const ws = wsRef.current;
      if (ws.readyState !== 1) {
        console.log('[presence] skip send: readyState =', ws.readyState);
        return;
      }
      const pos = pendingRef.current;
      pendingRef.current = null;
      lastSentRef.current = Date.now();
      console.log('[presence] sending position', pos.x.toFixed(0), pos.y.toFixed(0));
      ws.send(JSON.stringify({ type: 'position', x: pos.x, y: pos.y }));
    }, wait);
  }, [enabled]);

  const sendPing = useCallback((x: number, y: number) => {
    if (!enabled) return;
    const now = Date.now();
    if (now - lastPingRef.current < 500) return;
    lastPingRef.current = now;
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'ping', x, y }));
    }
  }, [enabled]);

  if (!enabled) {
    return { visitors: EMPTY, visitorCount: 0, pings: EMPTY_PINGS, reportPosition: noop, sendPing: noop, connected: false };
  }

  return { visitors, visitorCount, pings, reportPosition, sendPing, connected };
}
