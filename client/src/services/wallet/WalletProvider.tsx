import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    const savedChainId = localStorage.getItem('wallet_chainId');
    
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      setChainId(savedChainId ? parseInt(savedChainId) : 1);
    }
  }, []);

  const connect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        const chainIdHex = await (window as any).ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        if (accounts[0]) {
          setAddress(accounts[0]);
          setChainId(parseInt(chainIdHex, 16));
          setIsConnected(true);
          localStorage.setItem('wallet_address', accounts[0]);
          localStorage.setItem('wallet_chainId', String(parseInt(chainIdHex, 16)));
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_chainId');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          localStorage.setItem('wallet_address', accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        localStorage.setItem('wallet_chainId', String(newChainId));
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address]);

  return (
    <WalletContext.Provider value={{ isConnected, address, chainId, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (context === undefined) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      connect: async () => {},
      disconnect: () => {}
    };
  }
  return context;
}
