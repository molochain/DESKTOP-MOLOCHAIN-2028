import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code } from 'lucide-react';
import { getDocumentationApiUrl, getWsUrl } from '@/lib/apiConfig';

interface ServiceApiDocsProps {
  serviceName: string;
  serviceId: string;
}

const ServiceApiDocs: React.FC<ServiceApiDocsProps> = ({ serviceName, serviceId }) => {
  return (
    <div className="mt-10 border rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-600" />
            API Documentation
          </h3>
          <p className="text-gray-600 mt-1 text-sm">Integration endpoints for {serviceName}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-xs">API v1.0</Badge>
      </div>
      
      <Tabs defaultValue="rest" className="px-6 py-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="websocket">WebSocket</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rest" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Endpoint</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Method</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-blue-600 font-mono">/api/services/{serviceId}/status</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">GET</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Check service availability</td>
                  <td className="px-4 py-3 text-sm text-gray-700">No</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-blue-600 font-mono">/api/services/{serviceId}/pricing</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">GET</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Retrieve pricing information</td>
                  <td className="px-4 py-3 text-sm text-gray-700">No</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-blue-600 font-mono">/api/services/{serviceId}/book</td>
                  <td className="px-4 py-3 text-sm font-medium text-yellow-600">POST</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Book a new service</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-blue-600 font-mono">/api/services/{serviceId}/coverage</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">GET</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Get regional coverage</td>
                  <td className="px-4 py-3 text-sm text-gray-700">No</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <h4 className="font-medium text-sm text-gray-900">Example Request</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-4 text-sm overflow-x-auto">
              <code>{`curl -X GET "${getDocumentationApiUrl()}/api/services/${serviceId}/status" \\
  -H "Content-Type: application/json"`}</code>
            </pre>
            
            <h4 className="font-medium text-sm text-gray-900 mt-4">Example Response</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-4 text-sm overflow-x-auto">
              <code>{`{
  "id": "${serviceId}",
  "status": "active",
  "availability": {
    "EASIA": true,
    "EUR": true,
    "NAM": true,
    "SEASIA": true
  },
  "response_time": "0.85s"
}`}</code>
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="websocket" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Event Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Authentication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{`service.${serviceId}.status`}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Real-time updates on service status changes</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{`service.${serviceId}.availability`}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Real-time updates on regional availability</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{`service.${serviceId}.pricing`}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Real-time updates on pricing changes</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <h4 className="font-medium text-sm text-gray-900">WebSocket Connection</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-4 text-sm overflow-x-auto">
              <code>{`const socket = new WebSocket('${getWsUrl('/ws')}');

// Send authentication
socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_API_KEY'
  }));

  // Subscribe to service events
  socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'service.${serviceId}.status'
  }));
}

// Handle incoming messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Received update - handled by state management
};`}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceApiDocs;