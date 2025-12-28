/**
 * CMS Content Population Script
 * Automatically populates the Laravel CMS with blog posts, testimonials, FAQ, and team members
 */

import axios from 'axios';

const CMS_BASE_URL = 'https://cms.molochain.com/api';

interface CMSAuth {
  token: string;
  userId: number;
}

async function authenticate(): Promise<CMSAuth> {
  const email = process.env.CMS_ADMIN_EMAIL;
  const password = process.env.CMS_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('CMS credentials not found in environment variables');
  }

  const response = await axios.post(`${CMS_BASE_URL}/auth/login`, {
    email,
    password
  }, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  });

  return {
    token: response.data.token,
    userId: response.data.user.id
  };
}

async function createBlogPosts(token: string) {
  console.log('Creating blog posts...');
  
  const posts = [
    {
      title: 'The Future of Global Supply Chain: AI and Automation',
      slug: 'future-global-supply-chain-ai-automation',
      excerpt: 'Discover how artificial intelligence and automation are revolutionizing logistics operations worldwide.',
      content: `<h2>Embracing the Digital Revolution in Logistics</h2>
<p>The global supply chain industry is undergoing a massive transformation. Artificial intelligence, machine learning, and automation technologies are no longer futuristic concepts—they are reshaping how goods move around the world today.</p>
<h3>Key Trends Shaping the Industry</h3>
<ul>
<li><strong>Predictive Analytics:</strong> AI-powered systems can now forecast demand patterns, optimize inventory levels, and predict potential disruptions before they occur.</li>
<li><strong>Autonomous Vehicles:</strong> From warehouse robots to self-driving trucks, automation is reducing costs and improving efficiency across the supply chain.</li>
<li><strong>Real-time Visibility:</strong> IoT sensors and blockchain technology provide unprecedented transparency into shipment locations and conditions.</li>
</ul>
<h3>What This Means for Your Business</h3>
<p>Companies that embrace these technologies gain significant competitive advantages: reduced operational costs, faster delivery times, and improved customer satisfaction. At Molochain, we're at the forefront of this revolution, integrating cutting-edge solutions into our logistics services.</p>`,
      category: 'Industry Insights',
      tags: ['AI', 'automation', 'supply chain', 'technology'],
      is_published: true,
      is_featured: true
    },
    {
      title: '5 Ways to Reduce Shipping Costs Without Sacrificing Speed',
      slug: '5-ways-reduce-shipping-costs',
      excerpt: 'Learn practical strategies to optimize your logistics spending while maintaining fast delivery times.',
      content: `<h2>Smart Cost Optimization for Modern Shippers</h2>
<p>In today's competitive market, balancing shipping costs with delivery speed is crucial for business success. Here are five proven strategies to achieve both:</p>
<h3>1. Consolidate Shipments Strategically</h3>
<p>Combining multiple smaller shipments into larger ones can significantly reduce per-unit shipping costs. Our groupage services help businesses of all sizes benefit from consolidated shipping rates.</p>
<h3>2. Optimize Packaging</h3>
<p>Right-sized packaging reduces dimensional weight charges and protects products better, decreasing damage-related costs.</p>
<h3>3. Leverage Multi-Modal Transportation</h3>
<p>Combining air, sea, rail, and road transport optimizes both cost and speed for different route segments.</p>
<h3>4. Use Regional Distribution Centers</h3>
<p>Strategically located warehouses reduce last-mile delivery distances and costs while improving delivery times.</p>
<h3>5. Implement Demand Forecasting</h3>
<p>Accurate demand prediction allows for better inventory positioning and reduced expedited shipping needs.</p>`,
      category: 'Tips & Guides',
      tags: ['cost reduction', 'shipping', 'logistics tips', 'efficiency'],
      is_published: true,
      is_featured: false
    },
    {
      title: 'Understanding Customs Clearance: A Complete Guide',
      slug: 'understanding-customs-clearance-guide',
      excerpt: 'Navigate international trade regulations with confidence using our comprehensive customs clearance guide.',
      content: `<h2>Mastering International Customs Procedures</h2>
<p>Customs clearance is often the most complex aspect of international shipping. Understanding the process can save time, money, and prevent costly delays.</p>
<h3>Key Documents Required</h3>
<ul>
<li><strong>Commercial Invoice:</strong> Detailed description of goods, values, and parties involved</li>
<li><strong>Bill of Lading:</strong> Contract between shipper and carrier</li>
<li><strong>Packing List:</strong> Itemized list of package contents</li>
<li><strong>Certificate of Origin:</strong> Verifies where goods were manufactured</li>
</ul>
<h3>Common Challenges and Solutions</h3>
<p>Incorrect documentation is the leading cause of customs delays. Working with experienced customs brokers like Molochain ensures accurate paperwork and smooth clearance.</p>
<h3>Duty and Tax Considerations</h3>
<p>Understanding HS codes, tariff classifications, and available trade agreements can significantly reduce import duties and taxes.</p>`,
      category: 'Education',
      tags: ['customs', 'international trade', 'documentation', 'compliance'],
      is_published: true,
      is_featured: false
    },
    {
      title: 'Sustainable Logistics: Green Shipping Practices for 2025',
      slug: 'sustainable-logistics-green-shipping-2025',
      excerpt: 'Explore eco-friendly shipping solutions that reduce environmental impact while maintaining efficiency.',
      content: `<h2>The Rise of Sustainable Supply Chains</h2>
<p>Environmental responsibility is no longer optional—it's a business imperative. Consumers and regulators increasingly demand sustainable shipping practices.</p>
<h3>Green Initiatives in Logistics</h3>
<ul>
<li><strong>Carbon-Neutral Shipping:</strong> Offsetting emissions through verified environmental projects</li>
<li><strong>Electric Vehicle Fleets:</strong> Transitioning to zero-emission delivery vehicles</li>
<li><strong>Optimized Route Planning:</strong> AI-driven routing reduces fuel consumption</li>
<li><strong>Sustainable Packaging:</strong> Recyclable and biodegradable materials</li>
</ul>
<h3>Molochain's Commitment</h3>
<p>We're investing in sustainable technologies and partnering with eco-conscious carriers to offer greener shipping options without compromising service quality.</p>`,
      category: 'Sustainability',
      tags: ['sustainability', 'green logistics', 'environment', 'carbon neutral'],
      is_published: true,
      is_featured: true
    },
    {
      title: 'E-commerce Logistics: Meeting the Demands of Online Retail',
      slug: 'ecommerce-logistics-online-retail',
      excerpt: 'How modern logistics solutions are adapting to support the explosive growth of e-commerce.',
      content: `<h2>The E-commerce Logistics Revolution</h2>
<p>Online retail continues to grow at unprecedented rates, demanding new approaches to fulfillment and delivery.</p>
<h3>Key Challenges for E-commerce Sellers</h3>
<ul>
<li><strong>Fast Delivery Expectations:</strong> Customers now expect 2-day or same-day delivery</li>
<li><strong>Returns Management:</strong> Easy returns are essential for customer satisfaction</li>
<li><strong>International Expansion:</strong> Reaching global customers requires sophisticated logistics</li>
<li><strong>Peak Season Handling:</strong> Managing demand spikes during holidays</li>
</ul>
<h3>Solutions We Offer</h3>
<p>From drop-shipping services to international fulfillment, Molochain provides comprehensive e-commerce logistics solutions tailored to online businesses of all sizes.</p>`,
      category: 'E-commerce',
      tags: ['e-commerce', 'online retail', 'fulfillment', 'drop shipping'],
      is_published: true,
      is_featured: false
    },
    {
      title: 'Rail Freight: The Underutilized Hero of Logistics',
      slug: 'rail-freight-underutilized-hero-logistics',
      excerpt: 'Discover why rail transport is gaining popularity as a cost-effective and sustainable shipping option.',
      content: `<h2>Rediscovering Rail Transportation</h2>
<p>While air and sea freight dominate headlines, rail transport offers unique advantages that smart shippers are increasingly leveraging.</p>
<h3>Benefits of Rail Freight</h3>
<ul>
<li><strong>Cost Efficiency:</strong> Up to 50% cheaper than road transport for long distances</li>
<li><strong>Environmental Impact:</strong> 75% less carbon emissions than trucking</li>
<li><strong>Reliability:</strong> Less affected by traffic and weather conditions</li>
<li><strong>Capacity:</strong> Single trains can carry equivalent of hundreds of trucks</li>
</ul>
<h3>The New Silk Road</h3>
<p>The China-Europe rail connection has transformed international trade, offering a middle ground between slow sea freight and expensive air cargo. Transit times of 14-18 days at competitive rates make it ideal for many shipments.</p>`,
      category: 'Transport Modes',
      tags: ['rail freight', 'transportation', 'sustainability', 'China-Europe'],
      is_published: true,
      is_featured: false
    }
  ];

  for (const post of posts) {
    try {
      await axios.post(`${CMS_BASE_URL}/blog/posts`, post, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(`  ✓ Created: ${post.title}`);
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
        console.log(`  - Skipped (exists): ${post.title}`);
      } else {
        console.log(`  ✗ Failed: ${post.title} - ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

async function createTestimonials(token: string) {
  console.log('Creating testimonials...');
  
  const testimonials = [
    {
      name: 'Sarah Chen',
      company: 'TechGlobal Solutions',
      position: 'Supply Chain Director',
      content: 'Molochain transformed our international shipping operations. Their real-time tracking and proactive communication have reduced our delivery issues by 90%. An exceptional partner for any business serious about logistics.',
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: 'Marcus Weber',
      company: 'EuroTrade GmbH',
      position: 'CEO',
      content: 'We\'ve worked with many logistics providers, but Molochain stands out for their attention to detail and problem-solving abilities. They handled our complex customs requirements flawlessly.',
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: 'Aisha Patel',
      company: 'FastFashion Retail',
      position: 'Operations Manager',
      content: 'The e-commerce fulfillment services from Molochain have been game-changing for our business. Fast, reliable, and cost-effective. Our customers love the quick delivery times.',
      rating: 5,
      is_featured: false,
      is_active: true
    },
    {
      name: 'James O\'Brien',
      company: 'Industrial Parts Co.',
      position: 'Procurement Director',
      content: 'Heavy machinery logistics is challenging, but Molochain\'s special transport team handled our equipment with expertise. Their project logistics planning was thorough and professional.',
      rating: 4,
      is_featured: false,
      is_active: true
    },
    {
      name: 'Elena Rodriguez',
      company: 'Fresh Imports LLC',
      position: 'Founder',
      content: 'Temperature-controlled shipping for our perishable goods was always stressful until we partnered with Molochain. Their monitoring systems and quick response times give us peace of mind.',
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: 'David Kim',
      company: 'AutoParts International',
      position: 'Logistics Manager',
      content: 'Molochain\'s rail freight solutions between Europe and Asia saved us 40% compared to air freight while maintaining reasonable transit times. Highly recommend for cost-conscious shippers.',
      rating: 5,
      is_featured: false,
      is_active: true
    }
  ];

  for (const testimonial of testimonials) {
    try {
      await axios.post(`${CMS_BASE_URL}/testimonials`, testimonial, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(`  ✓ Created: ${testimonial.name}`);
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
        console.log(`  - Skipped (exists): ${testimonial.name}`);
      } else {
        console.log(`  ✗ Failed: ${testimonial.name} - ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

async function createFAQs(token: string) {
  console.log('Creating FAQs...');
  
  const faqs = [
    {
      question: 'What shipping services does Molochain offer?',
      answer: 'Molochain provides comprehensive logistics solutions including ocean freight (FCL/LCL), air freight, rail transport, trucking, warehousing, customs clearance, and specialized services like project cargo and temperature-controlled shipping.',
      category: 'Services',
      sort_order: 1,
      is_active: true
    },
    {
      question: 'How can I track my shipment?',
      answer: 'You can track your shipment 24/7 through our OTMS (Order & Transport Management System) portal. Simply log in with your credentials and enter your tracking number. You\'ll see real-time location updates, estimated arrival times, and any status changes.',
      category: 'Tracking',
      sort_order: 1,
      is_active: true
    },
    {
      question: 'What documents are required for international shipping?',
      answer: 'Standard documents include: Commercial Invoice, Packing List, Bill of Lading or Air Waybill, Certificate of Origin, and any product-specific certificates. Our customs experts will guide you through the exact requirements for your specific shipment and destination.',
      category: 'Documentation',
      sort_order: 1,
      is_active: true
    },
    {
      question: 'How long does ocean freight take?',
      answer: 'Transit times vary by route: Asia to Europe is typically 25-35 days, Asia to North America is 14-21 days, and intra-Asian routes range from 3-14 days. These are port-to-port times; add time for customs clearance and inland delivery.',
      category: 'Shipping',
      sort_order: 2,
      is_active: true
    },
    {
      question: 'Do you offer insurance for shipments?',
      answer: 'Yes, we offer comprehensive cargo insurance options to protect your goods against loss or damage during transit. Coverage can be customized based on cargo value, route, and specific risks. Contact our team for a quote.',
      category: 'Services',
      sort_order: 2,
      is_active: true
    },
    {
      question: 'What is the difference between FCL and LCL?',
      answer: 'FCL (Full Container Load) means you book an entire container for your goods. LCL (Less than Container Load) means your cargo shares container space with other shippers. FCL is more cost-effective for larger volumes, while LCL is ideal for smaller shipments.',
      category: 'Shipping',
      sort_order: 1,
      is_active: true
    },
    {
      question: 'How do I get a shipping quote?',
      answer: 'You can request a quote through our website, email, or by calling our sales team. Please provide: origin and destination, cargo details (weight, dimensions, type), desired shipping mode, and timeline. We typically respond within 24 hours.',
      category: 'Pricing',
      sort_order: 1,
      is_active: true
    },
    {
      question: 'Can you handle dangerous goods?',
      answer: 'Yes, Molochain is certified to handle dangerous goods (DG) across all transport modes. Our specialists ensure proper classification, packaging, labeling, and documentation in compliance with IMDG, IATA, and ADR regulations.',
      category: 'Services',
      sort_order: 3,
      is_active: true
    },
    {
      question: 'What warehousing services are available?',
      answer: 'Our warehousing solutions include short and long-term storage, inventory management, pick-and-pack services, cross-docking, and distribution. We have facilities strategically located across major trade hubs with climate-controlled options available.',
      category: 'Services',
      sort_order: 4,
      is_active: true
    },
    {
      question: 'How do I become a Molochain partner?',
      answer: 'We welcome partnerships with carriers, freight forwarders, customs brokers, and other logistics providers. Visit our Partner Network page or contact our business development team to discuss collaboration opportunities.',
      category: 'Partnership',
      sort_order: 1,
      is_active: true
    }
  ];

  for (const faq of faqs) {
    try {
      await axios.post(`${CMS_BASE_URL}/faqs`, faq, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(`  ✓ Created: ${faq.question.substring(0, 50)}...`);
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
        console.log(`  - Skipped (exists): ${faq.question.substring(0, 50)}...`);
      } else {
        console.log(`  ✗ Failed: ${faq.question.substring(0, 50)}... - ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

async function createTeamMembers(token: string) {
  console.log('Creating team members...');
  
  const teamMembers = [
    {
      name: 'Alexander Voronov',
      position: 'Chief Executive Officer',
      department: 'Executive',
      bio: 'Alexander brings over 25 years of experience in global logistics and supply chain management. He founded Molochain with a vision to revolutionize international trade through technology and exceptional service.',
      email: 'alexander@molochain.com',
      linkedin_url: 'https://linkedin.com/in/alexandervoronov',
      sort_order: 1,
      is_active: true
    },
    {
      name: 'Maria Santos',
      position: 'Chief Operations Officer',
      department: 'Operations',
      bio: 'Maria oversees all operational aspects of Molochain, ensuring seamless coordination across our global network. Her expertise in process optimization has driven significant efficiency improvements.',
      email: 'maria@molochain.com',
      linkedin_url: 'https://linkedin.com/in/mariasantos',
      sort_order: 2,
      is_active: true
    },
    {
      name: 'Thomas Mueller',
      position: 'Chief Technology Officer',
      department: 'Technology',
      bio: 'Thomas leads our digital transformation initiatives, including the OTMS platform and blockchain solutions. He previously built logistics systems for Fortune 500 companies.',
      email: 'thomas@molochain.com',
      linkedin_url: 'https://linkedin.com/in/thomasmueller',
      sort_order: 3,
      is_active: true
    },
    {
      name: 'Jennifer Park',
      position: 'VP of Sales & Business Development',
      department: 'Sales',
      bio: 'Jennifer drives our global expansion strategy and client relationships. Her deep understanding of customer needs helps shape our service offerings and partnership programs.',
      email: 'jennifer@molochain.com',
      linkedin_url: 'https://linkedin.com/in/jenniferpark',
      sort_order: 4,
      is_active: true
    },
    {
      name: 'Ahmed Hassan',
      position: 'Director of Customs & Compliance',
      department: 'Customs',
      bio: 'Ahmed leads our customs brokerage team, ensuring smooth clearance across 150+ countries. His expertise in trade regulations and compliance keeps our clients\' shipments moving.',
      email: 'ahmed@molochain.com',
      linkedin_url: 'https://linkedin.com/in/ahmedhassan',
      sort_order: 5,
      is_active: true
    },
    {
      name: 'Lisa Chen',
      position: 'Head of Customer Success',
      department: 'Customer Service',
      bio: 'Lisa ensures every Molochain client receives exceptional service. Her team provides 24/7 support and proactive communication throughout the shipping journey.',
      email: 'lisa@molochain.com',
      linkedin_url: 'https://linkedin.com/in/lisachen',
      sort_order: 6,
      is_active: true
    },
    {
      name: 'Roberto Gonzalez',
      position: 'Director of Warehousing',
      department: 'Warehousing',
      bio: 'Roberto manages our global network of distribution centers. His focus on automation and inventory optimization delivers significant value to e-commerce and retail clients.',
      email: 'roberto@molochain.com',
      linkedin_url: 'https://linkedin.com/in/robertogonzalez',
      sort_order: 7,
      is_active: true
    },
    {
      name: 'Sophie Williams',
      position: 'Sustainability Manager',
      department: 'Operations',
      bio: 'Sophie leads our green logistics initiatives, developing carbon-neutral shipping options and sustainable practices across our operations.',
      email: 'sophie@molochain.com',
      linkedin_url: 'https://linkedin.com/in/sophiewilliams',
      sort_order: 8,
      is_active: true
    }
  ];

  for (const member of teamMembers) {
    try {
      await axios.post(`${CMS_BASE_URL}/team`, member, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(`  ✓ Created: ${member.name}`);
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
        console.log(`  - Skipped (exists): ${member.name}`);
      } else {
        console.log(`  ✗ Failed: ${member.name} - ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

async function main() {
  console.log('=== CMS Content Population Script ===\n');
  
  try {
    console.log('Authenticating with CMS...');
    const auth = await authenticate();
    console.log('✓ Authentication successful\n');

    await createBlogPosts(auth.token);
    console.log('');
    
    await createTestimonials(auth.token);
    console.log('');
    
    await createFAQs(auth.token);
    console.log('');
    
    await createTeamMembers(auth.token);
    console.log('');

    console.log('=== Content population complete! ===');
    console.log('Visit your website to see the new content.');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
