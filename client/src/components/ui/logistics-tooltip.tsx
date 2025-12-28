import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface LogisticsTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export const logisticsTerms: Record<string, string> = {
  "RoRo": "Roll-on/Roll-off: A cargo shipping method where wheeled cargo (like cars or trucks) can be driven on and off the ship.",
  "TEU": "Twenty-foot Equivalent Unit: A standard measure used to calculate cargo capacity, based on the volume of a 20-foot-long shipping container.",
  "Cold Chain": "Temperature-controlled supply chain used for perishable items, ensuring consistent temperature during transport and storage.",
  "Cross-dock": "Logistics practice of unloading materials from inbound vehicles and loading them directly into outbound vehicles, with little or no storage in between.",
  "Multimodal": "Transportation using multiple modes of freight (sea, rail, road, or air) under a single contract.",
  "Transit Time": "The total time taken for cargo to move from origin to destination, including handling and storage time.",
  "Throughput": "The amount of cargo or material passing through a system (like a port or warehouse) in a given time period.",
};

export function LogisticsTooltip({ term, definition, children }: LogisticsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <p className="font-medium mb-1">{term}</p>
          <p className="text-sm text-muted-foreground">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
