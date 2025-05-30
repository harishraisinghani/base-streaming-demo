import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BlockStream from './components/BlockStream';
import WalletBalance from './components/WalletBalance';
import { WebSocketProvider } from './context/WebSocketContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #121212;
  color: white;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5em;
  margin: 0;
  background: linear-gradient(45deg, #00ff87, #60efff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #888;
  margin: 10px 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DebugInfo = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  color: #888;
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AppContainer>
        <Header>
          <Title>Loading...</Title>
        </Header>
      </AppContainer>
    );
  }

  return (
    <WebSocketProvider>
      <AppContainer>
        <Header>
          <Title>Base Sepolia Data Streams </Title>
          <Subtitle>Real-time blockchain data streamvisualization</Subtitle>
        </Header>
        <DashboardGrid>
          <BlockStream />
          <WalletBalance />
        </DashboardGrid>
        <DebugInfo>
          <div>Status: {error ? 'Error' : 'Connected'}</div>
          {error && <div>Error: {error}</div>}
        </DebugInfo>
      </AppContainer>
    </WebSocketProvider>
  );
}

export default App;
