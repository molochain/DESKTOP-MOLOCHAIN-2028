import { MoloChainSpinner, MoloChainLogo } from './molochain-loader';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <MoloChainLogo animate size="lg" />
        <MoloChainSpinner size="lg" text="Loading MoloChain..." />
      </div>
    </div>
  );
};

export const SectionLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <MoloChainSpinner size="md" text={text} />
    </div>
  );
};

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <MoloChainSpinner size="sm" text={text} />
    </div>
  );
};