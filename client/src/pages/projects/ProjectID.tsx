import { Timer, BarChart3, Globe2, Users, Network, BrainCircuit } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ProjectDetail from "@/components/projects/ProjectDetail";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProjectUpdateProvider } from "@/contexts/ProjectUpdateContext";

const ProjectPage = () => {
  const { t } = useTranslation();
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");

  const projects = [
  {
    id: 1,
    title: "Global E-commerce Distribution Network",
    description: "Implemented an integrated logistics solution for a major e-commerce platform, reducing delivery times by 40% while improving operational efficiency across 25 countries.",
    image: "https://images.unsplash.com/photo-1586528116493-b542988dd66b",
    category: "E-commerce",
    industry: "E-commerce",
    region: "asia-pacific",
    client: "Global Shop Co.",
    location: "Asia-Pacific",
    startDate: "January 2024",
    completionDate: "December 2024",
    metrics: [
      {
        label: "Delivery Time",
        value: "-40%",
        icon: <Timer className="w-6 h-6" />
      },
      {
        label: "Efficiency",
        value: "+35%",
        icon: <BarChart3 className="w-6 h-6" />
      },
      {
        label: "Coverage",
        value: "25 countries",
        icon: <Globe2 className="w-6 h-6" />
      }
    ],
    challenge: "Our client, a rapidly growing e-commerce platform, faced significant challenges in managing their expanding distribution network across Asia-Pacific. Key issues included lengthy delivery times, inconsistent tracking systems, and inefficient resource allocation across multiple countries.",
    solution: "We implemented a comprehensive logistics solution that integrated advanced tracking systems, automated warehouse management, and optimized delivery routes. The solution included real-time tracking capabilities, predictive analytics for demand forecasting, and a centralized management dashboard for monitoring operations across all locations.",
    results: [
      "Reduced average delivery time by 40% across all regions",
      "Improved operational efficiency by 35% through automation",
      "Successfully expanded operations to 25 countries",
      "Achieved 99.9% delivery accuracy rate",
      "Reduced operational costs by 25%"
    ],
    technologies: [
      "IoT Sensors",
      "Predictive Analytics",
      "Automated Sorting Systems",
      "Route Optimization",
      "Real-time Tracking",
      "Cloud Infrastructure"
    ],
    testimonials: [
      {
        author: "Sarah Chen",
        role: "Director of Operations",
        company: "Global Shop Co.",
        content: "The implementation of this distribution network has transformed our e-commerce operations. The 40% reduction in delivery times has significantly improved customer satisfaction and our competitive position in the market.",
        rating: 5
      },
      {
        author: "Michael Rodriguez",
        role: "Supply Chain Manager",
        company: "Global Shop Co.",
        content: "The automated warehouse management system and predictive analytics have revolutionized our inventory management. We've seen remarkable improvements in efficiency and accuracy.",
        rating: 5
      }
    ],
    routes: [
      {
        points: [
          {
            name: "Shenzhen, China",
            coordinates: [22.5431, 114.0579],
            type: "origin"
          },
          {
            name: "Singapore",
            coordinates: [1.3521, 103.8198],
            type: "transit"
          },
          {
            name: "Istanbul, Turkey",
            coordinates: [41.0082, 28.9784],
            type: "destination"
          }
        ],
        transportationType: "sea"
      },
      {
        points: [
          {
            name: "Istanbul, Turkey",
            coordinates: [41.0082, 28.9784],
            type: "origin"
          },
          {
            name: "Budapest, Hungary",
            coordinates: [47.4979, 19.0402],
            type: "transit"
          },
          {
            name: "Hamburg, Germany",
            coordinates: [53.5511, 9.9937],
            type: "destination"
          }
        ],
        transportationType: "rail"
      }
    ]
  },
  {
    id: 2,
    title: "Sustainable Cold Chain Solution",
    description: "Developed an eco-friendly cold chain network for pharmaceutical distribution across Europe, maintaining precise temperature control while reducing carbon footprint.",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866",
    category: "Healthcare",
    industry: "Healthcare",
    region: "europe",
    client: "PharmaCare Ltd.",
    location: "Europe",
    startDate: "March 2024",
    completionDate: "September 2024",
    metrics: [
      {
        label: "Carbon Reduction",
        value: "-30%",
        icon: <Timer className="w-6 h-6" />
      },
      {
        label: "Temperature Accuracy",
        value: "±0.5°C",
        icon: <BarChart3 className="w-6 h-6" />
      },
      {
        label: "Network Coverage",
        value: "500+ points",
        icon: <Globe2 className="w-6 h-6" />
      }
    ],
    challenge: "PharmaCare Ltd. needed a sustainable and reliable cold chain solution for distributing temperature-sensitive pharmaceuticals across Europe while minimizing environmental impact and ensuring regulatory compliance.",
    solution: "We designed and implemented an innovative cold chain network utilizing renewable energy sources, smart temperature monitoring, and advanced route optimization. The solution incorporated energy-efficient cooling systems and real-time temperature monitoring throughout the distribution process.",
    results: [
      "Achieved 30% reduction in carbon emissions",
      "Maintained temperature accuracy within ±0.5°C",
      "Established 500+ temperature-controlled distribution points",
      "Reduced energy consumption by 40%",
      "100% compliance with regulatory requirements"
    ],
    technologies: [
      "Smart Temperature Sensors",
      "Renewable Energy Systems",
      "Automated Climate Control",
      "Real-time Monitoring",
      "Digital Verification",
      "Green Technology"
    ],
    routes: [
      {
        points: [
          {
            name: "Amsterdam, Netherlands",
            coordinates: [52.3676, 4.9041],
            type: "origin"
          },
          {
            name: "Frankfurt, Germany",
            coordinates: [50.1109, 8.6821],
            type: "transit"
          },
          {
            name: "Istanbul, Turkey",
            coordinates: [41.0082, 28.9784],
            type: "destination"
          }
        ],
        transportationType: "road"
      }
    ]
  },
  {
    id: 3,
    title: "Smart Port Management System",
    description: "Revolutionized port operations with IoT-enabled container tracking and automated scheduling, significantly improving efficiency and reducing wait times.",
    image: "https://images.unsplash.com/photo-1577494999746-d2fe589cf35c",
    category: "Maritime",
    industry: "Maritime",
    region: "americas",
    client: "Americas Port Authority",
    location: "Americas",
    startDate: "June 2024",
    completionDate: "February 2025",
    metrics: [
      {
        label: "Throughput",
        value: "+60%",
        icon: <BarChart3 className="w-6 h-6" />
      },
      {
        label: "Wait Time",
        value: "-45%",
        icon: <Timer className="w-6 h-6" />
      },
      {
        label: "Staff Efficiency",
        value: "+40%",
        icon: <Users className="w-6 h-6" />
      }
    ],
    challenge: "The Americas Port Authority faced significant operational bottlenecks, with increasing container traffic leading to lengthy wait times, inefficient resource allocation, and reduced port throughput.",
    solution: "We implemented a comprehensive smart port management system featuring IoT-enabled container tracking, AI-powered scheduling, and automated yard management. The solution integrated real-time data analytics for optimal resource allocation and predictive maintenance.",
    results: [
      "Increased port throughput by 60%",
      "Reduced vessel wait times by 45%",
      "Improved staff efficiency by 40%",
      "Decreased operating costs by 35%",
      "Enhanced safety incidents reporting by 90%"
    ],
    technologies: [
      "IoT Sensors",
      "AI/ML Algorithms",
      "Automated Scheduling",
      "Real-time Analytics",
      "Digital Twin Technology",
      "5G Connectivity"
    ],
    routes: [
      {
        points: [
          {
            name: "Dubai, UAE",
            coordinates: [25.2048, 55.2708],
            type: "origin"
          },
          {
            name: "Istanbul, Turkey",
            coordinates: [41.0082, 28.9784],
            type: "transit"
          },
          {
            name: "Lagos, Nigeria",
            coordinates: [6.5244, 3.3792],
            type: "destination"
          }
        ],
        transportationType: "sea"
      }
    ]
  },
  {
    id: 4,
    title: "Advanced AI for Logistics Innovation",
    description: "Pioneering the development of artificial intelligence solutions to transform logistics planning, optimization, and decision-making across our global network.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    category: "Innovation",
    industry: "Technology",
    region: "global",
    client: "Internal R&D",
    location: "Global",
    startDate: "January 2025",
    completionDate: "December 2025",
    metrics: [
      {
        label: "AI Accuracy",
        value: "99.9%",
        icon: <BrainCircuit className="w-6 h-6" />
      },
      {
        label: "Process Automation",
        value: "85%",
        icon: <BarChart3 className="w-6 h-6" />
      },
      {
        label: "Efficiency Gain",
        value: "+200%",
        icon: <Timer className="w-6 h-6" />
      }
    ],
    challenge: "Traditional logistics operations face increasing complexity and scale that exceed human decision-making capabilities, requiring advanced AI solutions for optimization and automation.",
    solution: "Development of a comprehensive AI ecosystem incorporating machine learning, predictive analytics, and autonomous decision-making capabilities to revolutionize logistics operations.",
    results: [
      "Implemented AI-driven route optimization reducing delivery times by 40%",
      "Developed predictive maintenance systems reducing equipment downtime by 60%",
      "Created AI-powered demand forecasting with 99.9% accuracy",
      "Automated 85% of routine decision-making processes",
      "Reduced operational costs by 45% through AI optimization"
    ],
    technologies: [
      "Deep Learning",
      "Neural Networks",
      "Computer Vision",
      "Natural Language Processing",
      "Predictive Analytics",
      "Edge Computing"
    ],
    testimonials: [
      {
        author: "Dr. James Wilson",
        role: "Chief Innovation Officer",
        company: "TechLogistics International",
        content: "The AI solutions developed have exceeded our expectations. The 99.9% accuracy in demand forecasting has given us a significant competitive advantage in the market.",
        rating: 5
      },
      {
        author: "Emily Chang",
        role: "Head of AI Implementation",
        company: "Logistics Innovation Lab",
        content: "The integration of AI into our decision-making processes has resulted in unprecedented efficiency gains. The automation of routine tasks has freed up our team to focus on strategic initiatives.",
        rating: 5
      }
    ],
    routes: []
  },
  {
    id: 5,
    title: "Global Network Infrastructure Development",
    description: "Expanding and enhancing our global logistics network through strategic infrastructure development and technological integration.",
    image: "https://images.unsplash.com/photo-1492711350927-362f78c54d65",
    category: "Infrastructure",
    industry: "Logistics",
    region: "global",
    client: "Corporate Strategy",
    location: "Global",
    startDate: "March 2025",
    completionDate: "March 2026",
    metrics: [
      {
        label: "Network Coverage",
        value: "+200%",
        icon: <Network className="w-6 h-6" />
      },
      {
        label: "Connectivity",
        value: "200+ countries",
        icon: <Globe2 className="w-6 h-6" />
      },
      {
        label: "Performance",
        value: "+150%",
        icon: <BarChart3 className="w-6 h-6" />
      }
    ],
    challenge: "Meeting rapidly growing global logistics demands while ensuring seamless connectivity and efficient operations across diverse geographical regions.",
    solution: "Implementation of a comprehensive network expansion strategy, incorporating advanced technologies and strategic partnerships to create a robust global logistics infrastructure.",
    results: [
      "Extended network presence to over 200 countries",
      "Established 100+ new strategic partnerships",
      "Increased network capacity by 200%",
      "Reduced cross-border transit times by 60%",
      "Achieved 99.9% network reliability"
    ],
    technologies: [
      "5G Infrastructure",
      "IoT Networks",
      "Cloud Integration",
      "Digital Ledger",
      "Smart Sensors",
      "Satellite Communications"
    ],
    routes: []
  },
  {
    id: 6,
    title: "Middle East Strategic Hub Development",
    description: "Creating a cutting-edge logistics hub in the Middle East to serve as a vital connection point between Asia, Europe, and Africa.",
    image: "https://images.unsplash.com/photo-1565264029875-75dd906aee9d",
    category: "Infrastructure",
    industry: "Logistics",
    region: "middle-east",
    client: "Regional Development",
    location: "Middle East",
    startDate: "April 2025",
    completionDate: "October 2026",
    metrics: [
      {
        label: "Capacity",
        value: "3M TEU/year",
        icon: <BarChart3 className="w-6 h-6" />
      },
      {
        label: "Efficiency",
        value: "+180%",
        icon: <Timer className="w-6 h-6" />
      },
      {
        label: "Coverage",
        value: "3 continents",
        icon: <Globe2 className="w-6 h-6" />
      }
    ],
    challenge: "Establishing a world-class logistics hub that efficiently connects three continents while meeting diverse cargo handling requirements and strict regional regulations.",
    solution: "Development of a state-of-the-art multimodal facility featuring advanced automation, seamless customs integration, and sustainable operations.",
    results: [
      "Achieved 3 million TEU annual handling capacity",
      "Reduced processing times by 70%",
      "Connected 75+ major ports across three continents",
      "Implemented fully digital customs clearance",
      "Created 2000+ new job opportunities"
    ],
    technologies: [
      "Automated Handling Systems",
      "Smart Customs Integration",
      "AI Operations Management",
      "Renewable Energy Systems",
      "Digital Twin Technology",
      "Smart Security Systems"
    ],
    routes: []
  },
  {
    id: 7,
    title: "European Logistics Hub Transformation",
    description: "Establishing an advanced, sustainable European logistics hub to revolutionize regional distribution and set new industry standards.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    category: "Infrastructure",
    industry: "Logistics",
    region: "europe",
    client: "European Operations",
    location: "Central Europe",
    startDate: "June 2025",
    completionDate: "December 2026",
    metrics: [
      {
        label: "Automation",
        value: "95%",
        icon: <BrainCircuit className="w-6 h-6" />
      },
      {
        label: "Sustainability",
        value: "Zero Carbon",
        icon: <Globe2 className="w-6 h-6" />
      },
      {
        label: "Throughput",
        value: "+250%",
        icon: <BarChart3 className="w-6 h-6" />
      }
    ],
    challenge: "Transforming European logistics operations to meet increasing demand while adhering to strict environmental regulations and sustainability goals.",
    solution: "Implementation of a fully automated, carbon-neutral facility utilizing advanced robotics, AI-driven operations, and renewable energy systems.",
    results: [
      "Achieved 95% automation in operations",
      "Reached zero carbon emissions target",
      "Increased operational throughput by 250%",
      "Reduced operating costs by 60%",
      "Processed 2M+ packages daily"
    ],
    technologies: [
      "Robotic Process Automation",
      "Green Energy Systems",
      "AI Operations Management",
      "Smart Warehouse Management",
      "Electric Vehicle Fleet",
      "Automated Sorting Systems"
    ],
    routes: []
  },
  {
    id: 8,
    title: "Future of Logistics Initiative",
    description: "Transforming the global logistics landscape through breakthrough technologies and sustainable innovations.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Innovation",
    industry: "Logistics",
    region: "global",
    client: "Global Initiative",
    location: "Worldwide",
    startDate: "July 2025",
    completionDate: "July 2027",
    metrics: [
      {
        label: "Innovation",
        value: "150+ patents",
        icon: <BrainCircuit className="w-6 h-6" />
      },
      {
        label: "Impact",
        value: "Global Scale",
        icon: <Globe2 className="w-6 h-6" />
      },
      {
        label: "Adoption",
        value: "50+ partners",
        icon: <Users className="w-6 h-6" />
      }
    ],
    challenge: "Revolutionizing the traditional logistics industry to address future challenges in sustainability, efficiency, and global connectivity.",
    solution: "Development and implementation of groundbreaking technologies and methodologies that fundamentally transform logistics operations and environmental impact.",
    results: [
      "Filed 150+ patents for innovative solutions",
      "Achieved 90% reduction in carbon emissions",
      "Partnered with 50+ industry leaders",
      "Launched 25 revolutionary technologies",
      "Transformed logistics operations in 100+ countries"
    ],
    technologies: [
      "Quantum Computing",
      "Autonomous Systems",
      "Hyperloop Technology",
      "Space Logistics",
      "Green Technologies",
      "Advanced Robotics"
    ],
    testimonials: [
      {
        author: "Dr. Elena Martinez",
        role: "Director of Sustainability",
        company: "Global Initiative Partners",
        content: "This initiative has set new standards for sustainable logistics. The implementation of green technologies alongside cutting-edge solutions has shown that efficiency and environmental responsibility can go hand in hand.",
        rating: 5
      },
      {
        author: "Robert Kim",
        role: "Head of Strategy",
        company: "Future Logistics Alliance",
        content: "The breakthrough technologies developed through this initiative have positioned us at the forefront of logistics innovation. The impact on our global operations has been transformative.",
        rating: 5
      }
    ],
    routes: []
  }
];

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('projects.notFound.title')}</h1>
          <p className="text-gray-600">{t('projects.notFound.description')}</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              {t('projects.notFound.backToProjects')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProjectUpdateProvider>
      <ProjectDetail {...project} />
    </ProjectUpdateProvider>
  );
};

export default ProjectPage;