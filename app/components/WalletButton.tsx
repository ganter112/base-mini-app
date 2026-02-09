'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain, Connector } from 'wagmi';
import { base } from 'wagmi/chains';
import styles from './WalletButton.module.css';

// Non-EVM wallets to exclude
const NON_EVM_WALLETS = [
  'phantom', 'solflare', 'backpack', 'glow',
  'slope', 'sollet', 'torus solana', 'keplr',
  'leap', 'cosmostation', 'station',
];

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isEvmConnector(connector: Connector): boolean {
  const name = connector.name.toLowerCase();
  if (NON_EVM_WALLETS.some((w) => name.includes(w))) return false;
  if (connector.type === 'injected' || connector.type === 'eip6963') return true;
  return true;
}

function getConnectorLabel(connector: Connector): string {
  if (connector.name && connector.name !== 'Injected') return connector.name;
  return 'Browser Wallet';
}

export default function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== base.id;

  if (isConnected && address) {
    if (isWrongChain) {
      return (
        <div className={styles.connectedWrap}>
          <div className={styles.wrongChain}>
            Wrong network
          </div>
          <button
            className={styles.switchBtn}
            onClick={() => switchChain({ chainId: base.id })}
          >
            Switch to Base
          </button>
          <button className={styles.disconnectBtn} onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      );
    }

    return (
      <div className={styles.connectedWrap}>
        <div className={styles.connectedBadge}>
          <span className={styles.dot} />
          Base &middot; {shortenAddress(address)}
        </div>
        <button className={styles.disconnectBtn} onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // Only EVM wallets, no Farcaster connector
  const walletConnectors = connectors.filter(
    (c) => c.name !== 'Farcaster Mini App' && isEvmConnector(c)
  );

  if (walletConnectors.length === 0) {
    return (
      <div className={styles.walletList}>
        <p className={styles.noWallet}>No EVM wallet detected</p>
        <p className={styles.installHint}>
          Install MetaMask or Rabby to continue
        </p>
      </div>
    );
  }

  return (
    <div className={styles.walletList}>
      {walletConnectors.map((connector) => (
        <button
          key={connector.uid}
          className={styles.connect}
          onClick={() => connect({ connector, chainId: base.id })}
          disabled={isPending}
        >
          {isPending ? 'Connecting...' : `Connect ${getConnectorLabel(connector)}`}
        </button>
      ))}
    </div>
  );
}
