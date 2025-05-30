import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWebSocketWallet } from '../context/WebSocketContext';

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

const WalletBalance: React.FC = () => {
  const { wallet, status, error, walletRefreshMs } = useWebSocketWallet();

  return (
    <WalletContainer>
      <h2>GoldRush Token Balances Stream</h2>
      <RefreshMetric>
        Refresh: {walletRefreshMs !== null ? `${walletRefreshMs} ms` : 'N/A'}
      </RefreshMetric>
      {error ? (
        <StatusMessage>Error: {error}</StatusMessage>
      ) : !wallet ? (
        <StatusMessage>{status}</StatusMessage>
      ) : (
        <BalanceCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.9em', color: '#888' }}>Address</div>
            <div style={{ 
              wordBreak: 'break-all',
              overflowWrap: 'break-word'
            }}>{wallet.wallet_address}</div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.9em', color: '#888' }}>Last Block</div>
            <div>{wallet.last_block}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '10px' }}>
              Token Balances
            </div>
            {wallet.items.map((item, index) => (
              <TokenBalanceItem
                key={item.metadata.contract_address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.metadata.contract_ticker_symbol}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    {item.metadata.contract_name}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{item.balance_pretty}</div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    {item.is_native ? 'Native Token' : 'ERC20'}
                  </div>
                </div>
              </TokenBalanceItem>
            ))}
          </div>
        </BalanceCard>
      )}
    </WalletContainer>
  );
};

export default WalletBalance; 