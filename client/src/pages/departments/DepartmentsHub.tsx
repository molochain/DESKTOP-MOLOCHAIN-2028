import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, Users, Settings, Truck, Code, Megaphone, 
  Scale, Building2, Target, Network, BookOpen, FileText,
  Layers, Brain
} from 'lucide-react';

const departments = [
  {
    slug: 'accounting',
    name: 'Accounting & Finance',
    description: 'Financial control, budgets, and accounting operations',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600'
  },
  {
    slug: 'human-resources',
    name: 'Human Resources',
    description: 'Employee management, recruitment, and HR operations',
    icon: Users,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    slug: 'operations',
    name: 'Operations',
    description: 'Day-to-day business operations and process management',
    icon: Settings,
    color: 'from-orange-600 to-amber-600'
  },
  {
    slug: 'supply-chain',
    name: 'Supply Chain',
    description: 'Logistics, procurement, and supply chain management',
    icon: Truck,
    color: 'from-purple-600 to-violet-600'
  },
  {
    slug: 'technology-engineering',
    name: 'Technology & Engineering',
    description: 'Software development, infrastructure, and tech solutions',
    icon: Code,
    color: 'from-indigo-600 to-blue-600'
  },
  {
    slug: 'marketing-branding',
    name: 'Marketing & Branding',
    description: 'Brand strategy, marketing campaigns, and communications',
    icon: Megaphone,
    color: 'from-pink-600 to-rose-600'
  },
  {
    slug: 'legal-risk',
    name: 'Legal & Risk',
    description: 'Legal compliance, contracts, and risk management',
    icon: Scale,
    color: 'from-red-600 to-orange-600'
  },
  {
    slug: 'management',
    name: 'Management',
    description: 'Executive leadership and strategic management',
    icon: Building2,
    color: 'from-gray-600 to-slate-600'
  },
  {
    slug: 'strategy-development',
    name: 'Strategy & Development',
    description: 'Business strategy, planning, and development',
    icon: Target,
    color: 'from-teal-600 to-green-600'
  },
  {
    slug: 'network-partners',
    name: 'Network & Partners',
    description: 'Partner relationships and network management',
    icon: Network,
    color: 'from-cyan-600 to-teal-600'
  },
  {
    slug: 'learning-knowledge',
    name: 'Learning & Knowledge',
    description: 'Training, education, and knowledge management',
    icon: BookOpen,
    color: 'from-yellow-600 to-orange-600'
  },
  {
    slug: 'documents-library',
    name: 'Documents & Library',
    description: 'Document management and resource library',
    icon: FileText,
    color: 'from-slate-600 to-gray-600'
  },
  {
    slug: 'god-layer',
    name: 'God Layer',
    description: 'System administration and core infrastructure',
    icon: Layers,
    color: 'from-violet-600 to-purple-600'
  },
  {
    slug: 'rayanavabrain',
    name: 'Rayanavabrain',
    description: 'AI intelligence and machine learning systems',
    icon: Brain,
    color: 'from-fuchsia-600 to-pink-600'
  }
];

export default function DepartmentsHub() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Departments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Access all department dashboards and management systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Link key={dept.slug} href={`/departments/${dept.slug}`}>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group" data-testid={`card-department-${dept.slug}`}>
                  <CardHeader>
                    <div className={`p-3 bg-gradient-to-r ${dept.color} rounded-lg w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg mt-3">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dept.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
