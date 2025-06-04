"use client";

import { useWebSocketBlock } from "../context/WebSocketContext";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const BlockContainer = styled.div`
    padding: 20px;
    background: #1a1a1a;
    border-radius: 10px;
    margin: 20px;
    color: white;
    min-height: 200px;
    display: flex;
    flex-direction: column;
`;

const BlockCard = styled(motion.div)`
    background: #232323;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const BlockInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const BlockNumber = styled.div`
    font-weight: bold;
    font-size: 1.1em;
`;

const BlockHash = styled.div`
    font-size: 0.95em;
    color: #bdbdbd;
    margin: 2px 0 0 0;
`;

const BlockPayload = styled.div`
    font-size: 0.95em;
    color: #00ff87;
    margin-top: 2px;
    word-break: break-all;
`;

const BlockTime = styled.div`
    font-size: 1em;
    color: #bdbdbd;
    margin-left: 16px;
    white-space: nowrap;
`;

const RefreshMetric = styled.div`
    color: #00ff87;
    font-size: 0.95em;
    margin-bottom: 10px;
    text-align: right;
`;

const BlockStream: React.FC = () => {
    const { block, status, error, blockRefreshMs } = useWebSocketBlock();
    const [blocks, setBlocks] = useState<any[]>([]);
    const lastBlockNumber = useRef<string | null>(null);

    useEffect(() => {
        if (block && block.number !== lastBlockNumber.current) {
            setBlocks((prev) => {
                const newBlocks = [block, ...prev.filter((b) => b.number !== block.number)];
                return newBlocks.slice(0, 5);
            });
            lastBlockNumber.current = block.number;
        }
    }, [block]);

    return (
        <BlockContainer>
            <h2>RPC WebSocket Latest Blocks</h2>
            <RefreshMetric>Refresh: {blockRefreshMs !== null ? `${blockRefreshMs} ms` : "N/A"}</RefreshMetric>
            {error ? (
                <div style={{ color: "#888", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
                    Error: {error}
                </div>
            ) : blocks.length === 0 ? (
                <div style={{ color: "#888", textAlign: "center", padding: "20px", fontStyle: "italic" }}>{status}</div>
            ) : (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {blocks.map((b, index) => (
                        <BlockCard
                            key={b.number + b.hash}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <BlockInfo>
                                <BlockNumber>Block #{b.number}</BlockNumber>
                                <BlockHash>
                                    {b.hash.slice(0, 10)}...{b.hash.slice(-8)}
                                </BlockHash>
                                {b.payload_id && <BlockPayload>payload_id: {b.payload_id}</BlockPayload>}
                            </BlockInfo>
                            <BlockTime>{b.timestamp}</BlockTime>
                        </BlockCard>
                    ))}
                </div>
            )}
        </BlockContainer>
    );
};

export default BlockStream;
