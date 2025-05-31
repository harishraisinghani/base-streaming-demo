import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient, Client } from 'graphql-ws';

interface Block {
  number: string;
  hash: string;
  timestamp: string;
  payload_id?: string;
}

interface TokenBalanceData {
  balance: string;
  balance_pretty: string;
  is_native: boolean;
  metadata: {
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    contract_decimals: number;
  };
}

interface WalletData {
  wallet_address: string;
  last_block: string;
  items: TokenBalanceData[];
}

interface WebSocketContextType {
  block: Block | null;
  blockRefreshMs: number | null;
  wallet: WalletData | null;
  walletRefreshMs: number | null;
  status: string;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [block, setBlock] = useState<Block | null>(null);
  const [blockRefreshMs, setBlockRefreshMs] = useState<number | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletRefreshMs, setWalletRefreshMs] = useState<number | null>(null);
  const [status, setStatus] = useState('Connecting...');
  const [error, setError] = useState<string | null>(null);
  
  const baseWsRef = useRef<WebSocket | null>(null);
  const lastBlockTime = useRef<number | null>(null);
  const lastWalletTime = useRef<number | null>(null);

  // Base Sepolia WebSocket connection
  useEffect(() => {
    try {
      const ws = new WebSocket('wss://sepolia.flashblocks.base.org/ws');
      baseWsRef.current = ws;

      ws.onopen = () => {
        setStatus('Connected to Base Sepolia');
      };

      ws.onerror = (e) => {
        setError('Base Sepolia WebSocket error');
        setStatus('Error');
      };

      ws.onclose = () => {
        setStatus('Disconnected from Base Sepolia');
      };

      ws.onmessage = async (event) => {
        try {
          // Convert Blob to text if needed
          const messageText = event.data instanceof Blob 
            ? await event.data.text()
            : event.data;
            
          console.log('Received Base Sepolia message:', messageText);
          const data = JSON.parse(messageText);
          console.log('Parsed data:', data);
          if (data.base && data.diff && data.metadata) {
            const block = {
              number: parseInt(data.base.block_number, 16).toString(),
              hash: data.diff.block_hash,
              timestamp: data.base.timestamp
                ? new Date(parseInt(data.base.timestamp, 16) * 1000).toLocaleTimeString()
                : new Date().toLocaleTimeString(),
              payload_id: data.payload_id,
            };
            setBlock(block);
            const now = Date.now();
            if (lastBlockTime.current) {
              setBlockRefreshMs(now - lastBlockTime.current);
            }
            lastBlockTime.current = now;
          } else {
            console.log('Message missing required fields:', {
              hasBase: !!data.base,
              hasDiff: !!data.diff,
              hasMetadata: !!data.metadata
            });
          }
        } catch (err) {
          console.error('Error parsing Base Sepolia message:', err);
          console.error('Raw message:', event.data);
          setError('Error parsing Base Sepolia message');
        }
      };
    } catch (err) {
      setError('Failed to setup Base Sepolia WebSocket connection');
      setStatus('Error');
    }

    return () => {
      if (baseWsRef.current) baseWsRef.current.close();
    };
  }, []);

  // Covalent WebSocket connection with auto-resubscribe
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;
    let client: Client | null = null;

    function subscribe() {
      client = createClient({
        url: 'wss://gr-staging.streaming.covalenthq.com/graphql',
        webSocketImpl: WebSocket,
        lazy: false,
        retryAttempts: 100,
        shouldRetry: () => true,
      });

      unsubscribe = client.subscribe(
        {
          query: `
            subscription {
              walletBalances(
                chain_name: BASE_SEPOLIA
                wallet_address: "0x4200000000000000000000000000000000000011"
              ) {
                wallet_address
                last_block
                items {
                  balance
                  balance_pretty
                  is_native
                  metadata {
                    contract_name
                    contract_ticker_symbol
                    contract_address
                    contract_decimals
                  }
                }
              }
            }
          `,
        },
        {
          next: (data: { data?: { walletBalances: WalletData } }) => {
            if (data.data && data.data.walletBalances) {
              setWallet(data.data.walletBalances);
              const now = Date.now();
              if (lastWalletTime.current) {
                setWalletRefreshMs(now - lastWalletTime.current);
              }
              lastWalletTime.current = now;
            }
          },
          error: (err) => {
            setError('Covalent subscription error');
            console.error('[Covalent] Subscription error', err);
            // Try to resubscribe after a delay
            if (active) setTimeout(subscribe, 1000);
          },
          complete: () => {
            if (active) setTimeout(subscribe, 1000);
          },
        }
      );
    }

    subscribe();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
      if (client) client.dispose();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ block, blockRefreshMs, wallet, walletRefreshMs, status, error }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocketBlock() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketBlock must be used within a WebSocketProvider');
  return { block: ctx.block, status: ctx.status, error: ctx.error, blockRefreshMs: ctx.blockRefreshMs };
}

export function useWebSocketWallet() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketWallet must be used within a WebSocketProvider');
  return { wallet: ctx.wallet, status: ctx.status, error: ctx.error, walletRefreshMs: ctx.walletRefreshMs };
} 