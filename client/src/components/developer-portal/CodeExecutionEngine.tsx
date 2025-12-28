import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Download, 
  Share2,
  Terminal,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Activity
} from 'lucide-react';

interface ExecutionResult {
  id: string;
  status: 'running' | 'completed' | 'error' | 'timeout';
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  timestamp: Date;
  language: string;
  code: string;
}

interface CodeExecutionEngineProps {
  onExecute: (code: string, language: string) => Promise<ExecutionResult>;
  className?: string;
}

export function CodeExecutionEngine({ onExecute, className }: CodeExecutionEngineProps) {
  const [executions, setExecutions] = useState<ExecutionResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeExecution, setActiveExecution] = useState<string | null>(null);

  const handleExecute = async (code: string, language: string) => {
    if (isExecuting) return;

    setIsExecuting(true);
    const executionId = `exec-${Date.now()}`;
    setActiveExecution(executionId);

    try {
      const result = await onExecute(code, language);
      setExecutions(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 executions
    } catch (error) {
      const errorResult: ExecutionResult = {
        id: executionId,
        status: 'error',
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        memoryUsage: 0,
        timestamp: new Date(),
        language,
        code
      };
      setExecutions(prev => [errorResult, ...prev.slice(0, 19)]);
    } finally {
      setIsExecuting(false);
      setActiveExecution(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'timeout': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'timeout': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemoryUsage = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const downloadOutput = (execution: ExecutionResult) => {
    const content = `// Execution Result - ${execution.timestamp.toISOString()}
// Language: ${execution.language}
// Status: ${execution.status}
// Execution Time: ${formatExecutionTime(execution.executionTime)}
// Memory Usage: ${formatMemoryUsage(execution.memoryUsage)}

// CODE:
${execution.code}

// OUTPUT:
${execution.output}

${execution.error ? `// ERROR:\n${execution.error}` : ''}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="w-5 h-5" />
            <span>Code Execution Engine</span>
            {isExecuting && (
              <Badge className="bg-blue-100 text-blue-800">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Running
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[calc(100%-80px)]">
          <Tabs defaultValue="results" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Execution Results</TabsTrigger>
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                {executions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Play className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                    <p className="text-gray-500">Run your code to see execution results here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <Card key={execution.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(execution.status)}
                              <span className="font-medium">{execution.language}</span>
                              <Badge className={getStatusColor(execution.status)}>
                                {execution.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {execution.timestamp.toLocaleTimeString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadOutput(execution)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{formatExecutionTime(execution.executionTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Cpu className="w-4 h-4 text-gray-400" />
                              <span>{formatMemoryUsage(execution.memoryUsage)}</span>
                            </div>
                          </div>

                          {execution.output && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Output:</h4>
                              <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                                {execution.output}
                              </pre>
                            </div>
                          )}

                          {execution.error && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2 text-red-600">Error:</h4>
                              <pre className="bg-red-50 text-red-800 p-3 rounded text-sm overflow-x-auto border border-red-200">
                                {execution.error}
                              </pre>
                            </div>
                          )}

                          <details className="mt-4">
                            <summary className="cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-800">
                              View Code
                            </summary>
                            <pre className="bg-gray-50 p-3 rounded text-sm mt-2 overflow-x-auto border">
                              {execution.code}
                            </pre>
                          </details>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="performance" className="h-[calc(100%-40px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Execution Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Total Executions</span>
                          <span className="font-medium">{executions.length}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Successful</span>
                          <span className="font-medium text-green-600">
                            {executions.filter(e => e.status === 'completed').length}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Failed</span>
                          <span className="font-medium text-red-600">
                            {executions.filter(e => e.status === 'error').length}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Avg. Execution Time</span>
                          <span className="font-medium">
                            {executions.length > 0
                              ? formatExecutionTime(
                                  executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length
                                )
                              : '0ms'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Language Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        executions.reduce((acc, execution) => {
                          acc[execution.language] = (acc[execution.language] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([language, count]) => (
                        <div key={language} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{language}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                      
                      {executions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center">No executions yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default CodeExecutionEngine;