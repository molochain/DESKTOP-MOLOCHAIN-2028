import { BlogPost, Testimonial, GroupedFaqs, TeamMember } from '@/services/cmsContentService';

export const demoBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Future of Global Supply Chain Management',
    slug: 'future-global-supply-chain-management',
    excerpt: 'Discover how AI and advanced analytics are revolutionizing the way goods move across borders, enabling real-time tracking and unprecedented transparency.',
    content: `<p>The logistics industry is undergoing a massive transformation. With the advent of artificial intelligence, machine learning, and advanced analytics, supply chains are becoming smarter, faster, and more transparent than ever before.</p>
    <h2>Key Trends Shaping the Future</h2>
    <p>From predictive analytics that anticipate disruptions before they occur to autonomous vehicles that operate around the clock, the future of logistics is here. Companies that embrace these technologies will gain a significant competitive advantage.</p>
    <h2>Real-Time Visibility</h2>
    <p>Modern tracking systems provide end-to-end visibility, allowing stakeholders to monitor shipments in real-time. This transparency reduces uncertainty and enables better decision-making.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    author: 'Sarah Chen',
    published_at: '2024-12-01T10:00:00Z',
    created_at: '2024-12-01T10:00:00Z',
    categories: [{ id: 1, name: 'Industry Trends', slug: 'industry-trends' }],
    tags: ['supply chain', 'technology', 'AI'],
    is_featured: true,
    reading_time: 5
  },
  {
    id: 2,
    title: 'Sustainable Shipping: Reducing Your Carbon Footprint',
    slug: 'sustainable-shipping-reducing-carbon-footprint',
    excerpt: 'Learn how MoloChain is helping businesses achieve their sustainability goals through eco-friendly logistics solutions.',
    content: `<p>Environmental sustainability is no longer optional in the logistics industry. With increasing regulatory pressure and consumer demand for green practices, companies must adapt their shipping strategies.</p>
    <h2>Our Green Initiatives</h2>
    <p>MoloChain has implemented several initiatives to reduce environmental impact, including optimized routing algorithms, partnerships with eco-friendly carriers, and carbon offset programs.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
    author: 'Michael Torres',
    published_at: '2024-11-28T14:30:00Z',
    created_at: '2024-11-28T14:30:00Z',
    categories: [{ id: 2, name: 'Sustainability', slug: 'sustainability' }],
    tags: ['green logistics', 'sustainability', 'environment'],
    is_featured: false,
    reading_time: 4
  },
  {
    id: 3,
    title: 'Cold Chain Logistics: Best Practices for Temperature-Sensitive Cargo',
    slug: 'cold-chain-logistics-best-practices',
    excerpt: 'Everything you need to know about maintaining product integrity for pharmaceuticals, food, and other temperature-sensitive goods.',
    content: `<p>Cold chain logistics requires specialized handling to maintain product quality. From pharmaceuticals to fresh produce, temperature control is critical throughout the supply chain.</p>
    <h2>Essential Components</h2>
    <p>Successful cold chain management includes proper packaging, temperature monitoring devices, trained personnel, and contingency planning for delays.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800',
    author: 'Dr. Emily Park',
    published_at: '2024-11-25T09:15:00Z',
    created_at: '2024-11-25T09:15:00Z',
    categories: [{ id: 3, name: 'Specialized Services', slug: 'specialized-services' }],
    tags: ['cold chain', 'pharmaceuticals', 'temperature control'],
    is_featured: false,
    reading_time: 6
  },
  {
    id: 4,
    title: 'Navigating International Customs: A Complete Guide',
    slug: 'navigating-international-customs-guide',
    excerpt: 'Simplify your cross-border shipping with our comprehensive guide to customs clearance and compliance.',
    content: `<p>International shipping involves complex customs procedures that can delay shipments if not handled correctly. Understanding the requirements upfront saves time and money.</p>
    <h2>Documentation Requirements</h2>
    <p>Essential documents include commercial invoices, packing lists, certificates of origin, and any product-specific certifications required by the destination country.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
    author: 'Ahmed Hassan',
    published_at: '2024-11-20T11:00:00Z',
    created_at: '2024-11-20T11:00:00Z',
    categories: [{ id: 4, name: 'Customs & Compliance', slug: 'customs-compliance' }],
    tags: ['customs', 'international shipping', 'compliance'],
    is_featured: false,
    reading_time: 7
  },
  {
    id: 5,
    title: 'How E-Commerce is Transforming Last-Mile Delivery',
    slug: 'ecommerce-transforming-last-mile-delivery',
    excerpt: 'The explosion of online shopping has created new challenges and opportunities for last-mile logistics providers.',
    content: `<p>The growth of e-commerce has fundamentally changed consumer expectations for delivery speed and flexibility. Same-day and next-day delivery are becoming the norm.</p>
    <h2>Meeting Customer Expectations</h2>
    <p>Successful last-mile delivery requires a combination of technology, local partnerships, and flexible fulfillment options including lockers, pickup points, and scheduled deliveries.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
    author: 'Lisa Wang',
    published_at: '2024-11-15T16:45:00Z',
    created_at: '2024-11-15T16:45:00Z',
    categories: [{ id: 5, name: 'E-Commerce', slug: 'ecommerce' }],
    tags: ['e-commerce', 'last-mile', 'delivery'],
    is_featured: true,
    reading_time: 5
  },
  {
    id: 6,
    title: 'Warehouse Automation: ROI and Implementation Strategies',
    slug: 'warehouse-automation-roi-implementation',
    excerpt: 'Explore the business case for warehouse automation and learn how to successfully implement automated systems.',
    content: `<p>Warehouse automation offers significant benefits including increased throughput, reduced errors, and lower labor costs. However, successful implementation requires careful planning.</p>
    <h2>Calculating ROI</h2>
    <p>Key factors in automation ROI include current labor costs, order volume, accuracy rates, and the total cost of ownership for automated systems.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800',
    author: 'James Miller',
    published_at: '2024-11-10T08:30:00Z',
    created_at: '2024-11-10T08:30:00Z',
    categories: [{ id: 6, name: 'Warehousing', slug: 'warehousing' }],
    tags: ['automation', 'warehousing', 'technology'],
    is_featured: false,
    reading_time: 8
  }
];

export const demoTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Robert Johnson',
    company: 'TechFlow Industries',
    position: 'Supply Chain Director',
    content: 'MoloChain has transformed our logistics operations. Their real-time tracking and proactive communication have reduced our shipping delays by 40%. Truly a game-changer for our business.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Maria Garcia',
    company: 'Global Retail Corp',
    position: 'Operations Manager',
    content: 'The level of service and expertise at MoloChain is unmatched. They handled our complex multi-country distribution seamlessly and helped us expand into new markets with confidence.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: 'David Kim',
    company: 'PharmaCare Solutions',
    position: 'Logistics Coordinator',
    content: 'Their cold chain capabilities are exceptional. We trust MoloChain with our temperature-sensitive pharmaceuticals, and they have never let us down. The monitoring systems provide complete peace of mind.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    name: 'Emma Thompson',
    company: 'Artisan Exports',
    position: 'CEO',
    content: 'As a small business, we needed a logistics partner who could grow with us. MoloChain provided personalized service from day one and has supported our 300% growth over the past two years.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    is_active: true,
    sort_order: 4
  },
  {
    id: 5,
    name: 'Ahmed Al-Rashid',
    company: 'Gulf Trading LLC',
    position: 'Import/Export Manager',
    content: 'Their customs brokerage expertise saved us countless hours and thousands of dollars. MoloChain navigates complex regulations effortlessly and ensures our shipments clear customs without delays.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    is_active: true,
    sort_order: 5
  }
];

export const demoFAQs: GroupedFaqs[] = [
  {
    topic: {
      id: 1,
      name: 'Shipping & Delivery',
      slug: 'shipping-delivery',
      description: 'Common questions about our shipping services and delivery options',
      sort_order: 1
    },
    faqs: [
      {
        id: 1,
        question: 'What shipping methods does MoloChain offer?',
        answer: '<p>We offer a comprehensive range of shipping methods including:</p><ul><li><strong>Air Freight</strong> - Fastest option for time-sensitive cargo</li><li><strong>Ocean Freight</strong> - Cost-effective for large shipments (FCL & LCL)</li><li><strong>Road Transportation</strong> - Flexible trucking services across regions</li><li><strong>Rail Freight</strong> - Eco-friendly option for continental transport</li><li><strong>Multimodal Solutions</strong> - Combining methods for optimal routes</li></ul>',
        sort_order: 1,
        is_active: true
      },
      {
        id: 2,
        question: 'How can I track my shipment?',
        answer: '<p>You can track your shipment 24/7 through our online tracking portal. Simply enter your tracking number on our website or use our mobile app. You\'ll receive real-time updates including:</p><ul><li>Current location and status</li><li>Estimated arrival time</li><li>Any delays or exceptions</li><li>Proof of delivery when completed</li></ul>',
        sort_order: 2,
        is_active: true
      },
      {
        id: 3,
        question: 'What are your delivery timeframes?',
        answer: '<p>Delivery times vary based on the shipping method and destination:</p><ul><li><strong>Express Air</strong>: 1-3 business days</li><li><strong>Standard Air</strong>: 3-7 business days</li><li><strong>Ocean Freight</strong>: 15-45 days depending on route</li><li><strong>Road Transport (Europe)</strong>: 2-7 business days</li></ul><p>Contact us for specific quotes based on your origin and destination.</p>',
        sort_order: 3,
        is_active: true
      }
    ]
  },
  {
    topic: {
      id: 2,
      name: 'Pricing & Payments',
      slug: 'pricing-payments',
      description: 'Information about our pricing structure and payment options',
      sort_order: 2
    },
    faqs: [
      {
        id: 4,
        question: 'How is shipping cost calculated?',
        answer: '<p>Shipping costs are calculated based on several factors:</p><ul><li><strong>Weight and dimensions</strong> - We use the greater of actual weight or volumetric weight</li><li><strong>Origin and destination</strong> - Distance and route complexity</li><li><strong>Shipping method</strong> - Air, sea, road, or rail</li><li><strong>Service level</strong> - Express, standard, or economy</li><li><strong>Special requirements</strong> - Temperature control, hazardous materials, etc.</li></ul><p>Request a free quote for accurate pricing.</p>',
        sort_order: 1,
        is_active: true
      },
      {
        id: 5,
        question: 'What payment methods do you accept?',
        answer: '<p>We accept multiple payment methods for your convenience:</p><ul><li>Credit/Debit Cards (Visa, Mastercard, American Express)</li><li>Bank Wire Transfer</li><li>Corporate Accounts with NET terms</li><li>Letters of Credit for international trade</li></ul><p>Business customers can apply for credit terms based on shipping volume.</p>',
        sort_order: 2,
        is_active: true
      }
    ]
  },
  {
    topic: {
      id: 3,
      name: 'Customs & Documentation',
      slug: 'customs-documentation',
      description: 'Help with international shipping requirements',
      sort_order: 3
    },
    faqs: [
      {
        id: 6,
        question: 'What documents are required for international shipping?',
        answer: '<p>Required documents typically include:</p><ul><li><strong>Commercial Invoice</strong> - Detailed description and value of goods</li><li><strong>Packing List</strong> - Contents of each package</li><li><strong>Bill of Lading/Air Waybill</strong> - Shipping contract</li><li><strong>Certificate of Origin</strong> - Country where goods were manufactured</li></ul><p>Additional documents may be required based on the product type and destination country. Our team will guide you through the requirements.</p>',
        sort_order: 1,
        is_active: true
      },
      {
        id: 7,
        question: 'Do you handle customs clearance?',
        answer: '<p>Yes! We provide comprehensive customs brokerage services including:</p><ul><li>Preparation and submission of customs declarations</li><li>Duty and tax calculations</li><li>Compliance with import/export regulations</li><li>Management of licenses and permits</li><li>Resolution of customs holds or inspections</li></ul><p>Our experienced customs specialists ensure smooth clearance in over 150 countries.</p>',
        sort_order: 2,
        is_active: true
      }
    ]
  },
  {
    topic: {
      id: 4,
      name: 'Special Services',
      slug: 'special-services',
      description: 'Information about our specialized logistics solutions',
      sort_order: 4
    },
    faqs: [
      {
        id: 8,
        question: 'Can you handle temperature-sensitive cargo?',
        answer: '<p>Absolutely! Our cold chain solutions are designed for:</p><ul><li><strong>Pharmaceuticals</strong> - Including vaccines and biologics</li><li><strong>Fresh food</strong> - Produce, dairy, and meat products</li><li><strong>Chemicals</strong> - Temperature-sensitive materials</li></ul><p>Features include real-time temperature monitoring, validated packaging, and compliance with GDP/GMP standards.</p>',
        sort_order: 1,
        is_active: true
      },
      {
        id: 9,
        question: 'Do you offer warehousing services?',
        answer: '<p>Yes, we operate modern warehouses worldwide offering:</p><ul><li>Short and long-term storage</li><li>Pick and pack fulfillment</li><li>Inventory management systems</li><li>Cross-docking capabilities</li><li>Value-added services (labeling, kitting, etc.)</li></ul><p>Our facilities are strategically located near major ports and airports.</p>',
        sort_order: 2,
        is_active: true
      }
    ]
  }
];

export const demoTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Murat Yilmaz',
    role: 'Chief Executive Officer',
    department: 'Leadership',
    bio: 'With over 20 years of experience in global logistics, Murat founded MoloChain with a vision to transform how businesses manage their supply chains. He leads our strategic initiatives and drives innovation across the organization.',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    email: 'murat.yilmaz@molochain.com',
    linkedin: 'https://linkedin.com/in/muratyilmaz',
    twitter: 'https://twitter.com/muratyilmaz',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Ayse Kaya',
    role: 'Chief Operations Officer',
    department: 'Leadership',
    bio: 'Ayse oversees all operational aspects of MoloChain, ensuring seamless execution across our global network. Her expertise in process optimization has been instrumental in our growth.',
    photo: 'https://randomuser.me/api/portraits/women/65.jpg',
    email: 'ayse.kaya@molochain.com',
    linkedin: 'https://linkedin.com/in/aysekaya',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: 'Mehmet Demir',
    role: 'Chief Technology Officer',
    department: 'Technology',
    bio: 'Mehmet leads our technology initiatives, from our tracking platform to AI-powered optimization tools. He brings deep expertise in logistics technology and digital transformation.',
    photo: 'https://randomuser.me/api/portraits/men/22.jpg',
    email: 'mehmet.demir@molochain.com',
    linkedin: 'https://linkedin.com/in/mehmetdemir',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    name: 'Elena Petrova',
    role: 'VP of Global Operations',
    department: 'Operations',
    bio: 'Elena manages our international operations, coordinating with partners and carriers across 150+ countries. She ensures our global network delivers consistent excellence.',
    photo: 'https://randomuser.me/api/portraits/women/33.jpg',
    email: 'elena.petrova@molochain.com',
    linkedin: 'https://linkedin.com/in/elenapetrova',
    is_active: true,
    sort_order: 4
  },
  {
    id: 5,
    name: 'Ali Hassan',
    role: 'Director of Customs & Compliance',
    department: 'Compliance',
    bio: 'Ali leads our customs brokerage and trade compliance team. His expertise ensures smooth clearance and regulatory adherence for all international shipments.',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    email: 'ali.hassan@molochain.com',
    linkedin: 'https://linkedin.com/in/alihassan',
    is_active: true,
    sort_order: 5
  },
  {
    id: 6,
    name: 'Sarah Mitchell',
    role: 'Head of Customer Success',
    department: 'Customer Success',
    bio: 'Sarah ensures our clients receive exceptional service and support. She leads the team that helps businesses optimize their logistics strategies and resolve any challenges.',
    photo: 'https://randomuser.me/api/portraits/women/28.jpg',
    email: 'sarah.mitchell@molochain.com',
    linkedin: 'https://linkedin.com/in/sarahmitchell',
    is_active: true,
    sort_order: 6
  },
  {
    id: 7,
    name: 'Thomas Weber',
    role: 'Director of Warehousing',
    department: 'Operations',
    bio: 'Thomas oversees our global warehousing network, implementing best practices in inventory management and fulfillment operations across all facilities.',
    photo: 'https://randomuser.me/api/portraits/men/52.jpg',
    email: 'thomas.weber@molochain.com',
    linkedin: 'https://linkedin.com/in/thomasweber',
    is_active: true,
    sort_order: 7
  },
  {
    id: 8,
    name: 'Fatima Al-Sayed',
    role: 'Regional Manager - Middle East',
    department: 'Regional Operations',
    bio: 'Fatima manages our Middle East operations, bringing deep regional expertise and strong relationships with local partners and authorities.',
    photo: 'https://randomuser.me/api/portraits/women/55.jpg',
    email: 'fatima.alsayed@molochain.com',
    linkedin: 'https://linkedin.com/in/fatimalsayed',
    is_active: true,
    sort_order: 8
  }
];
