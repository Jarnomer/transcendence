import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Interface for establishing WebSocket connections
 * @param url - The WebSocket server URL to connect to
 * @param onMessage - Callback function for receiving messages
 * @returns WebSocket reference, status and utility methods
 */

// Constants defined outside the hook
const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // ms

export interface WebSocketMessage {
  type: string; // Message identifier (eg. 'live_chat')
  payload: any; // Actual data being sent
}

export const useWebSocket = (
  url: string | null,
  // Callback function that gets called whenever a
  // message is received from the WebSocket server
  onMessage: (data: any) => void = () => {},
) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Establishes connection, handles setting up and reconnection logic
  const connect = useCallback(() => {
    // Validate URL before attempting connection
    if (!url) {
      console.error('Invalid WebSocket URL');
      setConnectionStatus('error');
      return;
    }

    // Close any existing connection
    if (ws.current) {
      ws.current.close();
    }

    // Set the connecting status
    console.log('Connecting to WebSocket:', url);
    setConnectionStatus('connecting');

    try {
      // Try to create a new WebSocket connection
      ws.current = new WebSocket(url);

      // Event handler for successful connection
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempt.current = 0;
      };

      // Event handler for closing connection
      ws.current.onclose = (event) => {
        const current = reconnectAttempt.current;

        console.log('WebSocket disconnected', event.code, event.reason);
        setConnectionStatus('disconnected');

        // Don't reconnect if closed cleanly or max attempts reached
        if (event.wasClean || current >= RECONNECT_MAX_ATTEMPTS) {
          return;
        }

        reconnectAttempt.current += 1;
        console.log('Attempting to reconnect...');
        setConnectionStatus('reconnecting');

        // Clear any existing reconnection timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }

        // Schedule next reconnection attempt
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_INTERVAL);
      };

      // Event handler for connection errors
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      // Event handler for incoming messages
      ws.current.onmessage = (event) => {
        try {
          // Try to parse the message as JSON
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage(data);
        } catch (error) {
          // Error if not valid JSON message
          console.error('Error parsing WebSocket message:', error);
          setLastMessage(event.data);
          onMessage(event.data);
        }
      };
    } catch (error) {
      // Error during initialization
      console.error('Error creating WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [url, onMessage]);

  // Function to send messages, convert object to JSON string if necessary
  const sendMessage = useCallback((message: WebSocketMessage | string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
      ws.current.send(messageToSend);
      return true;
    }
    console.error('WebSocket not connected');
    return false; // Return false on error
  }, []);

  // Function to manually disconnect WebSocket
  const disconnect = useCallback(() => {
    if (ws.current) {
      // 1000 is the normal closure code
      ws.current.close(1000, 'Closed by client');
    }

    // Clear any pending reconnection attempts
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ws, // WebSocket reference
    connectionStatus, // Current connection status
    lastMessage, // Most recent message received
    sendMessage, // Function to send messages
    disconnect, // Function to manually disconnect
    reconnect: connect, // Function to manually reconnect
  };
};
