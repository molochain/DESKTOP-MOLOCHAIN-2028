import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, Edit } from 'lucide-react';
import { useState } from 'react';

interface Annotation {
  id: string;
  table: string;
  column?: string;
  note: string;
  author: string;
  timestamp: string;
}

export function SimpleAnnotationPanel({ selectedTable }: { selectedTable?: string }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: '1',
      table: 'users',
      column: 'email',
      note: 'This field must be unique and validated',
      author: 'Admin',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  const handleAddAnnotation = () => {
    if (newAnnotation.trim() && selectedTable) {
      const annotation: Annotation = {
        id: Date.now().toString(),
        table: selectedTable,
        note: newAnnotation,
        author: 'Current User',
        timestamp: new Date().toISOString()
      };
      setAnnotations([...annotations, annotation]);
      setNewAnnotation('');
      setIsAddingAnnotation(false);
    }
  };

  const tableAnnotations = annotations.filter(a => !selectedTable || a.table === selectedTable);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Schema Annotations
          </CardTitle>
          {selectedTable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAddingAnnotation && (
          <div className="mb-4 space-y-2">
            <Textarea
              placeholder="Add annotation for this table..."
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddAnnotation}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setIsAddingAnnotation(false);
                  setNewAnnotation('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {tableAnnotations.length > 0 ? (
          <div className="space-y-3">
            {tableAnnotations.map((annotation) => (
              <div key={annotation.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{annotation.table}</Badge>
                    {annotation.column && (
                      <Badge variant="secondary">{annotation.column}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(annotation.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-1">{annotation.note}</p>
                <p className="text-xs text-muted-foreground">by {annotation.author}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {selectedTable ? 'No annotations for this table' : 'Select a table to view annotations'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}