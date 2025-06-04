"use client";

import { createClient, Client } from "graphql-ws";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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
    quote_rate_usd: number;
    quote_usd: number;
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
    const [status, setStatus] = useState("Connecting...");
    const [error, setError] = useState<string | null>(null);

    const baseWsRef = useRef<WebSocket | null>(null);
    const lastBlockTime = useRef<number | null>(null);
    const lastWalletTime = useRef<number | null>(null);

    // Base Sepolia WebSocket connection
    useEffect(() => {
        try {
            const ws = new WebSocket("wss://sepolia.flashblocks.base.org/ws");
            baseWsRef.current = ws;

            ws.onopen = () => {
                setStatus("Connected to Base Sepolia");
            };

            ws.onerror = (e) => {
                setError("Base Sepolia WebSocket error");
                setStatus("Error");
            };

            ws.onclose = () => {
                setStatus("Disconnected from Base Sepolia");
            };

            ws.onmessage = async (event) => {
                try {
                    // Convert Blob to text if needed
                    const messageText = event.data instanceof Blob ? await event.data.text() : event.data;
                    const data = JSON.parse(messageText);
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
                    }
                } catch (err) {
                    setError("Error parsing Base Sepolia message");
                }
            };
        } catch (err) {
            setError("Failed to setup Base Sepolia WebSocket connection");
            setStatus("Error");
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
                url: "wss://gr-staging.streaming.covalenthq.com/graphql",
                webSocketImpl: WebSocket,
                lazy: false,
                retryAttempts: 100,
                shouldRetry: () => true,
            });

            unsubscribe = client.subscribe(
                {
                    query: `
            subscription {
              tokenBalancesForWalletAddress(
                chain_name: BASE_SEPOLIA
                wallet_address: "0x4200000000000000000000000000000000000011"
              ) {
                wallet_address
                last_block
                items {
                  balance
                  quote_rate_usd
                  quote_usd
                  is_native
                  balance_pretty
                  metadata {
                    contract_name
                    contract_address
                    contract_decimals
                    contract_ticker_symbol
                  }
                }
              }
            }
          `,
                },
                {
                    next: (data: { data?: { tokenBalancesForWalletAddress: WalletData } }) => {
                        console.log("[GoldRush] Update received at", new Date().toISOString(), data);
                        if (data.data && data.data.tokenBalancesForWalletAddress) {
                            setWallet(data.data.tokenBalancesForWalletAddress);
                            const now = Date.now();
                            if (lastWalletTime.current) {
                                setWalletRefreshMs(now - lastWalletTime.current);
                            }
                            lastWalletTime.current = now;
                        }
                    },
                    error: (err) => {
                        setError("Covalent subscription error");
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
    if (!ctx) throw new Error("useWebSocketBlock must be used within a WebSocketProvider");
    return { block: ctx.block, status: ctx.status, error: ctx.error, blockRefreshMs: ctx.blockRefreshMs };
}

export function useWebSocketWallet() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error("useWebSocketWallet must be used within a WebSocketProvider");
    return { wallet: ctx.wallet, status: ctx.status, error: ctx.error, walletRefreshMs: ctx.walletRefreshMs };
}