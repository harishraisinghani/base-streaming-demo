"use client";

import { useWebSocketWallet } from "../context/WebSocketContext";
import { useWebSocketBlock } from "../context/WebSocketContext";
import { motion, AnimatePresence } from "framer-motion";
import React, { useMemo, useEffect, useState } from "react";
import styled from "styled-components";

const WalletContainer = styled.div`
    padding: 20px;
    background: #1a1a1a;
    border-radius: 10px;
    margin: 20px;
    color: white;
    min-height: 200px;
    display: flex;
    flex-direction: column;
`;

const BalanceCard = styled(motion.div)`
    background: #2a2a2a;
    padding: 20px;
    border-radius: 8px;
    margin-top: 15px;
    flex: 1;
`;

const TokenBalanceItem = styled(motion.div)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #333;
    border-radius: 6px;
    margin-top: 10px;
`;

const StatusMessage = styled.div`
    color: #888;
    text-align: center;
    padding: 20px;
    font-style: italic;
`;

const RefreshMetric = styled.div`
    color: #00ff87;
    font-size: 0.95em;
    margin-bottom: 10px;
    text-align: right;
`;

const Label = styled.div`
    font-size: 0.9em;
    color: #888;
`;

const Address = styled.div`
    word-break: break-all;
    overflow-wrap: break-word;
`;

const TokenSymbol = styled.div`
    font-weight: bold;
`;

const TokenName = styled.div`
    font-size: 0.8em;
    color: #888;
`;

const TokenBalanceValue = styled.div`
    text-align: right;
`;

const UsdValue = styled.div`
    font-size: 0.9em;
    color: #00ff87;
    margin-top: 4px;
`;

const TokenType = styled.div`
    font-size: 0.8em;
    color: #888;
`;

const WalletBalance: React.FC = React.memo(() => {
    const { wallet, status, error, walletRefreshMs } = useWebSocketWallet();
    const { block: rpcBlock } = useWebSocketBlock();

    // Throttle wallet updates to the UI for smoother rendering
    const [displayWallet, setDisplayWallet] = useState(wallet);
    useEffect(() => {
        if (!wallet) return;
        const id = setTimeout(() => setDisplayWallet(wallet), 100);
        return () => clearTimeout(id);
    }, [wallet]);

    // Memoize the token list to avoid recalculating on every render
    const tokenItems = useMemo(() => {
        if (!displayWallet) return null;
        return (
            <AnimatePresence initial={false}>
                {displayWallet.items.map((item, index) => (
                    <TokenBalanceItem
                        key={item.metadata.contract_address}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        layout
                    >
                        <div>
                            <TokenSymbol>{item.metadata.contract_ticker_symbol}</TokenSymbol>
                            <TokenName>{item.metadata.contract_name}</TokenName>
                        </div>
                        <TokenBalanceValue>
                            <div>
                                {item.is_native
                                    ? Number(item.balance_pretty).toLocaleString(undefined, {
                                          minimumFractionDigits: 4,
                                          maximumFractionDigits: 4,
                                      })
                                    : item.balance_pretty}
                            </div>
                            <UsdValue>
                                ${Number(item.quote_usd).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </UsdValue>
                            <TokenType>{item.is_native ? "Native Token" : "ERC20"}</TokenType>
                        </TokenBalanceValue>
                    </TokenBalanceItem>
                ))}
            </AnimatePresence>
        );
    }, [displayWallet]);

    // Compute the block number to display
    const goldrushBlock = displayWallet?.last_block;
    const rpcBlockNumber = rpcBlock?.number;
    let showBlock = goldrushBlock;
    let isLagging = false;
    if (rpcBlockNumber && goldrushBlock && Number(goldrushBlock) < Number(rpcBlockNumber)) {
        showBlock = rpcBlockNumber;
        isLagging = true;
    }

    return (
        <WalletContainer>
            <h2>GoldRush Token Balances Stream</h2>
            <RefreshMetric>
                Refresh: {walletRefreshMs !== null ? walletRefreshMs.toString().padStart(3, "0") + " ms" : "N/A"}
            </RefreshMetric>
            {error ? (
                <StatusMessage>Error: {error}</StatusMessage>
            ) : !displayWallet ? (
                <StatusMessage>{status}</StatusMessage>
            ) : (
                <BalanceCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ marginBottom: "15px" }}>
                        <Label>Address</Label>
                        <Address>{displayWallet.wallet_address}</Address>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <Label>Last Block</Label>
                        <div style={isLagging ? { color: "#888" } : {}}>{showBlock}</div>
                    </div>
                    <div>
                        <Label style={{ marginBottom: "10px" }}>Token Balances</Label>
                        {tokenItems}
                    </div>
                </BalanceCard>
            )}
        </WalletContainer>
    );
});

export default WalletBalance;
