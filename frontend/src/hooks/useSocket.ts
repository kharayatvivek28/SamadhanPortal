import { useEffect, useRef, useCallback } from "react";

interface UseSocketOptions {
  url?: string;
  enabled?: boolean;
  onEvent?: (event: string, data: any) => void;
}

/**
 * Hook for Socket.io real-time connection.
 * Currently scaffolded — requires socket.io-client to be installed
 * and socket.io to be configured on the backend.
 *
 * Usage:
 * ```
 * const { emit } = useSocket({
 *   url: 'http://localhost:5000',
 *   onEvent: (event, data) => {
 *     if (event === 'complaintUpdated') refetchComplaints();
 *   }
 * });
 * ```
 */
const useSocket = ({ url, enabled = true, onEvent }: UseSocketOptions = {}) => {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    // Socket.io integration placeholder
    // To activate: npm install socket.io-client
    // Then import and connect:
    //
    // import { io } from 'socket.io-client';
    // const socket = io(url || window.location.origin);
    // socketRef.current = socket;
    //
    // socket.on('connect', () => console.log('Socket connected'));
    // socket.on('complaintUpdated', (data) => onEvent?.('complaintUpdated', data));
    // socket.on('newComplaint', (data) => onEvent?.('newComplaint', data));
    // socket.on('statusChanged', (data) => onEvent?.('statusChanged', data));
    //
    // return () => socket.disconnect();

    console.log('[useSocket] Socket.io placeholder - install socket.io-client to enable');
  }, [url, enabled, onEvent]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { emit, socket: socketRef.current };
};

export default useSocket;
