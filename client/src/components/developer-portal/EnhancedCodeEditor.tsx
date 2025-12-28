import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Share2, 
  Settings, 
  Terminal,
  FileText,
  Code2,
  Palette,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWsUrl } from '@/lib/apiConfig';

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: string;
  modifiedBy: string;
}

interface EnhancedCodeEditorProps {
  file: CodeFile;
  onSave: (content: string) => void;
  onRun?: (code: string) => void;
  className?: string;
}

export function EnhancedCodeEditor({ 
  file, 
  onSave, 
  onRun, 
  className 
}: EnhancedCodeEditorProps) {
  const [content, setContent] = useState(file.content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate code execution for demo purposes
  const executeCode = async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    setOutput('Executing code...\n');
    
    try {
      // Simulate API call to execute code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock output based on language
      let mockOutput = '';
      switch (file.language) {
        case 'javascript':
        case 'typescript':
          mockOutput = `> node ${file.name}\nHello from ${file.name}!\nExecution completed in 1.2s\n`;
          break;
        case 'python':
          mockOutput = `> python ${file.name}\nHello from ${file.name}!\nExecution completed in 0.8s\n`;
          break;
        default:
          mockOutput = `> Running ${file.name}\nOutput: Success\nExecution completed\n`;
      }
      
      setOutput(mockOutput);
      onRun(content);
    } catch (error) {
      setOutput(`Error: ${error}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    onSave(content);
    setOutput(prev => prev + `\n> File saved: ${file.name}\n`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setOutput(prev => prev + `\n> Code copied to clipboard\n`);
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    setOutput(prev => prev + `\n> Downloaded: ${file.name}\n`);
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'javascript':
      case 'typescript':
        return '⚡';
      case 'python':
        return '🐍';
      case 'java':
        return '☕';
      case 'go':
        return '🐹';
      default:
        return '📄';
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const codeTemplates = {
    javascript: {
      'API Call': `fetch('/api/services')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
      'WebSocket': `const ws = new WebSocket('${getWsUrl('/ws/tracking')}');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};`,
      'Async Function': `async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`
    },
    typescript: {
      'Interface': `interface LogisticsService {
  id: string;
  name: string;
  type: 'ocean' | 'air' | 'ground';
  active: boolean;
}`,
      'Generic Function': `function processShipment<T extends Shipment>(shipment: T): T {
  // Process shipment logic
  return shipment;
}`,
      'API Client': `class MoloChainAPI {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async getServices(): Promise<Service[]> {
    const response = await fetch(\`\${this.baseURL}/api/services\`);
    return response.json();
  }
}`
    },
    python: {
      'Class Definition': `class LogisticsAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_services(self):
        import requests
        response = requests.get(f"{self.base_url}/api/services")
        return response.json()`,
      'Async Function': `import asyncio
import aiohttp

async def fetch_tracking(tracking_number: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/tracking/{tracking_number}") as response:
            return await response.json()`,
      'Error Handling': `try:
    result = process_shipment(data)
    print(f"Success: {result}")
except Exception as e:
    print(f"Error: {e}")
finally:
    cleanup_resources()`
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullscreen && "fixed inset-0 z-50 bg-background",
      className
    )}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getLanguageIcon(file.language)}</span>
              <CardTitle className="text-lg">{file.name}</CardTitle>
              <Badge variant="outline">{file.language}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMinimap(!showMinimap)}
              >
                {showMinimap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              {onRun && (
                <Button onClick={executeCode} disabled={isRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="mx-4">
              <TabsTrigger value="editor" className="flex items-center space-x-2">
                <Code2 className="w-4 h-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Output</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 flex p-4">
              <div className="flex-1 flex">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={cn(
                      "w-full h-full p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
                      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                    placeholder="Start coding..."
                    spellCheck={false}
                  />
                </div>
                
                {showMinimap && (
                  <div className="w-32 ml-4">
                    <div className="h-full bg-gray-100 dark:bg-gray-800 rounded border p-2">
                      <div className="text-xs text-gray-500 mb-2">Minimap</div>
                      <div className="space-y-1">
                        {content.split('\n').slice(0, 20).map((line, i) => (
                          <div
                            key={i}
                            className="h-1 bg-gray-300 dark:bg-gray-600 rounded"
                            style={{ width: `${Math.min(line.length * 2, 100)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Code Templates for {file.language}</h3>
                <div className="grid gap-4">
                  {Object.entries(codeTemplates[file.language as keyof typeof codeTemplates] || {}).map(([name, template]) => (
                    <Card key={name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{name}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertAtCursor(template)}
                        >
                          Insert
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {template}
                      </pre>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="output" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <pre className="text-sm font-mono bg-black text-green-400 p-4 rounded">
                  {output || 'No output yet. Run your code to see results.'}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="minimap"
                    checked={showMinimap}
                    onChange={(e) => setShowMinimap(e.target.checked)}
                  />
                  <label htmlFor="minimap" className="text-sm">Show minimap</label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedCodeEditor;