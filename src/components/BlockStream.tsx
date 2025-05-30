import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketBlock } from '../context/WebSocketContext';

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

const BlockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  flex: 1;
`;

const BlockItem = styled(motion.div)`
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const BlockStream: React.FC = () => {
  const { block, status, error, blockRefreshMs } = useWebSocketBlock();
  const [blocks, setBlocks] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (block) {
      setBlocks((prev) => {
        if (prev.some(b => b.payload_id === block.payload_id)) return prev;
        const updated = [block, ...prev];
        updated.sort((a, b) => {
          const numA = parseInt(a.number, 10);
          const numB = parseInt(b.number, 10);
          if (numA !== numB) return numB - numA;
          return (b.payload_id || '').localeCompare(a.payload_id || '');
        });
        return updated.slice(0, 10);
      });
    }
  }, [block]);

  return (
    <BlockContainer>
      <h2>RPC WebSocket Latest Blocks</h2>
      <RefreshMetric>
        Refresh: {blockRefreshMs !== null ? `${blockRefreshMs} ms` : 'N/A'}
      </RefreshMetric>
      {error ? (
        <StatusMessage>Error: {error}</StatusMessage>
      ) : blocks.length === 0 ? (
        <StatusMessage>{status}</StatusMessage>
      ) : (
        <BlockList>
          <AnimatePresence>
            {blocks.map((block) => (
              <BlockItem
                key={block.payload_id || block.hash}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <strong>Block #{block.number}</strong>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    {block.hash.slice(0, 10)}...{block.hash.slice(-8)}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#00ff87' }}>
                    payload_id: {block.payload_id}
                  </div>
                </div>
                <div style={{ color: '#888' }}>{block.timestamp}</div>
              </BlockItem>
            ))}
          </AnimatePresence>
        </BlockList>
      )}
    </BlockContainer>
  );
};

export default BlockStream; 