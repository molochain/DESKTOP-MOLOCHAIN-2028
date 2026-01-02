import { lazy, Suspense } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const departmentComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'accounting': lazy(() => import('@/departments/accounting/pages/Dashboard')),
  'human-resources': lazy(() => import('@/departments/human-resources/pages/Dashboard')),
  'operations': lazy(() => import('@/departments/operations/pages/Dashboard')),
  'supply-chain': lazy(() => import('@/departments/supply-chain/pages/Dashboard')),
  'technology-engineering': lazy(() => import('@/departments/technology-engineering/pages/Dashboard')),
  'marketing-branding': lazy(() => import('@/departments/marketing-branding/pages/Dashboard')),
  'legal-risk': lazy(() => import('@/departments/legal-risk/pages/Dashboard')),
  'management': lazy(() => import('@/departments/management/pages/Dashboard')),
  'strategy-development': lazy(() => import('@/departments/strategy-development/pages/Dashboard')),
  'network-partners': lazy(() => import('@/departments/network-partners/pages/Dashboard')),
  'learning-knowledge': lazy(() => import('@/departments/learning-knowledge/pages/Dashboard')),
  'documents-library': lazy(() => import('@/departments/documents-library/pages/Dashboard')),
  'god-layer': lazy(() => import('@/departments/god-layer/pages/Dashboard')),
  'rayanavabrain': lazy(() => import('@/departments/rayanavabrain/pages/Dashboard'))
};

export default function DepartmentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  
  const DepartmentComponent = departmentComponents[slug];

  if (!DepartmentComponent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Department Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The department "{slug}" does not exist.
          </p>
          <Link href="/departments">
            <Button data-testid="button-back-departments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <Link href="/departments">
          <Button variant="ghost" size="sm" data-testid="button-back-departments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Departments
          </Button>
        </Link>
      </div>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }>
        <DepartmentComponent />
      </Suspense>
    </div>
  );
}
