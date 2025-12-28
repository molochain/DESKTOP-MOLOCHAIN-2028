import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: "hub" | "distribution" | "destination";
  name: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

// Sample network data
const sampleNetworkData: NetworkData = {
  nodes: [
    { id: "hub1", type: "hub", name: "Central Hub" },
    { id: "dist1", type: "distribution", name: "Regional Center 1" },
    { id: "dist2", type: "distribution", name: "Regional Center 2" },
    { id: "dist3", type: "distribution", name: "Regional Center 3" },
    { id: "dest1", type: "destination", name: "Destination 1" },
    { id: "dest2", type: "destination", name: "Destination 2" },
    { id: "dest3", type: "destination", name: "Destination 3" },
    { id: "dest4", type: "destination", name: "Destination 4" }
  ],
  links: [
    { source: "hub1", target: "dist1", value: 1 },
    { source: "hub1", target: "dist2", value: 1 },
    { source: "hub1", target: "dist3", value: 1 },
    { source: "dist1", target: "dest1", value: 1 },
    { source: "dist1", target: "dest2", value: 1 },
    { source: "dist2", target: "dest2", value: 1 },
    { source: "dist2", target: "dest3", value: 1 },
    { source: "dist3", target: "dest3", value: 1 },
    { source: "dist3", target: "dest4", value: 1 }
  ]
};

const DistributionNetworkMap = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 500;

    // Create force simulation
    const simulation = d3.forceSimulation<Node>()
      .force("link", d3.forceLink<Node, Link>().id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(sampleNetworkData.links)
      .join("line")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", 2);

    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(sampleNetworkData.nodes)
      .join("g");

    // Add circles to nodes
    node.append("circle")
      .attr("r", (d: Node) => d.type === "hub" ? 20 : d.type === "distribution" ? 15 : 10)
      .style("fill", (d: Node) => {
        switch (d.type) {
          case "hub": return "hsl(var(--primary))";
          case "distribution": return "hsl(var(--secondary))";
          default: return "hsl(var(--muted))";
        }
      })
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Add labels to nodes
    node.append("text")
      .text((d: Node) => d.name)
      .attr("x", 15)
      .attr("y", 5)
      .style("font-size", "12px")
      .style("fill", "currentColor");

    // Add titles for hover effect
    node.append("title")
      .text((d: Node) => d.name);

    // Update positions on simulation tick
    simulation.nodes(sampleNetworkData.nodes).on("tick", () => {
      link
        .attr("x1", (d: Link) => (d.source as Node).x ?? 0)
        .attr("y1", (d: Link) => (d.source as Node).y ?? 0)
        .attr("x2", (d: Link) => (d.target as Node).x ?? 0)
        .attr("y2", (d: Link) => (d.target as Node).y ?? 0);

      node
        .attr("transform", (d: Node) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Update link positions
    simulation.force<d3.ForceLink<Node, Link>>("link")!
      .links(sampleNetworkData.links);

    // Add zoom capability
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        svg.selectAll("g").attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <Card className="p-4">
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Distribution Network Visualization</h3>
        <div className="aspect-video bg-background/5 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
        <div className="mt-4 flex gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Central Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span>Regional Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Destinations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistributionNetworkMap;