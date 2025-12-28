import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';
import { featureFlags } from '@/hooks/use-feature-flags';

const BlockchainExplorer = lazy(() => import('@/pages/blockchain/BlockchainExplorer'));
const SmartContracts = lazy(() => import('@/pages/blockchain/SmartContracts'));
const TokenBridge = lazy(() => import('@/pages/blockchain/TokenBridge'));
const TokenLaunchpad = lazy(() => import('@/pages/blockchain/TokenLaunchpad'));
const NFTMarketplace = lazy(() => import('@/pages/blockchain/NFTMarketplace'));
const DeFiIntegration = lazy(() => import('@/pages/blockchain/DeFiIntegration'));
const SmartContractPayments = lazy(() => import('@/pages/blockchain/SmartContractPayments'));
const WalletIntegration = lazy(() => import('@/pages/blockchain/WalletIntegration'));
const CrossChainAnalytics = lazy(() => import('@/pages/blockchain/CrossChainAnalytics'));
const AdvancedAnalytics = lazy(() => import('@/pages/dashboard/AdvancedAnalytics'));
const BlockchainAnalyticsDashboard = lazy(() => import('@/pages/blockchain/BlockchainAnalyticsDashboard'));
const YieldAggregator = lazy(() => import('@/pages/blockchain/YieldAggregator'));
const PerpetualFutures = lazy(() => import('@/pages/blockchain/PerpetualFutures'));
const PredictionMarket = lazy(() => import('@/pages/blockchain/PredictionMarket'));
const DAOTreasury = lazy(() => import('@/pages/blockchain/DAOTreasury'));
const Governance = lazy(() => import('@/pages/blockchain/Governance'));
const RWATokenization = lazy(() => import('@/pages/blockchain/RWATokenization'));

if (featureFlags.blockchainEnabled) {
  RouteRegistry.registerCategory({
    name: 'blockchain',
    order: 15,
    routes: [
      { path: '/blockchain', component: BlockchainExplorer, layout: 'default' },
      { path: '/smart-contracts', component: SmartContracts, layout: 'default' },
      { path: '/token-bridge', component: TokenBridge, layout: 'default' },
      { path: '/token-launchpad', component: TokenLaunchpad, layout: 'default' },
      { path: '/nft-marketplace', component: NFTMarketplace, layout: 'default' },
      { path: '/defi', component: DeFiIntegration, layout: 'default' },
      { path: '/smart-contract-payments', component: SmartContractPayments, layout: 'default' },
      { path: '/wallet', component: WalletIntegration, layout: 'default' },
      { path: '/cross-chain', component: CrossChainAnalytics, layout: 'default' },
      { path: '/advanced-analytics', component: AdvancedAnalytics, layout: 'default' },
      { path: '/blockchain-analytics', component: BlockchainAnalyticsDashboard, layout: 'default' },
      { path: '/yield-aggregator', component: YieldAggregator, layout: 'default' },
      { path: '/perpetual-futures', component: PerpetualFutures, layout: 'default' },
      { path: '/prediction-market', component: PredictionMarket, layout: 'default' },
      { path: '/dao-treasury', component: DAOTreasury, layout: 'default' },
      { path: '/governance', component: Governance, layout: 'default' },
      { path: '/rwa-tokenization', component: RWATokenization, layout: 'default' },
    ]
  });
}

export const blockchainRoutes = featureFlags.blockchainEnabled 
  ? RouteRegistry.getRoutesByCategory('blockchain') 
  : [];
