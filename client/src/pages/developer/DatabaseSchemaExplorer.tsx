import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SimpleAnnotationPanel } from '@/components/schema-annotation/SimpleAnnotationPanel';
import { 
  Database, 
  Table, 
  Link, 
  Search, 
  Filter, 
  Eye, 
  GitBranch, 
  Network,
  Activity,
  Download,
  ArrowRight,
  Key,
  Hash,
  Type,
  FileText,
  ChevronRight
} from 'lucide-react';

interface DatabaseTable {
  table_name: string;
  column_count: number;
  row_count: number;
  table_size: string;
  has_foreign_keys: boolean;
  has_indexes: boolean;
  category: string;
}

interface DatabaseColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

interface ForeignKey {
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

export default function DatabaseSchemaExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch database tables
  const { data: tablesData, isLoading: tablesLoading, error: tablesError } = useQuery({
    queryKey: ['/api/database/tables'],
  });

  // Fetch database columns
  const { data: columnsData, isLoading: columnsLoading } = useQuery({
    queryKey: ['/api/database/columns'],
  });

  // Fetch foreign keys
  const { data: foreignKeysData, isLoading: foreignKeysLoading } = useQuery({
    queryKey: ['/api/database/foreign-keys'],
  });

  // Safely extract arrays from the response data
  const tables = useMemo((): DatabaseTable[] => {
    if (!tablesData) return [];
    if (Array.isArray(tablesData)) return tablesData as DatabaseTable[];
    if (tablesData && typeof tablesData === 'object' && 'rows' in tablesData) {
      return (tablesData as any).rows || [];
    }
    return [];
  }, [tablesData]);

  const columns = useMemo((): DatabaseColumn[] => {
    if (!columnsData) return [];
    if (Array.isArray(columnsData)) return columnsData as DatabaseColumn[];
    if (columnsData && typeof columnsData === 'object' && 'rows' in columnsData) {
      return (columnsData as any).rows || [];
    }
    return [];
  }, [columnsData]);

  const foreignKeys = useMemo((): ForeignKey[] => {
    if (!foreignKeysData) return [];
    if (Array.isArray(foreignKeysData)) return foreignKeysData as ForeignKey[];
    if (foreignKeysData && typeof foreignKeysData === 'object' && 'rows' in foreignKeysData) {
      return (foreignKeysData as any).rows || [];
    }
    return [];
  }, [foreignKeysData]);

  // Filter tables based on search and category
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch = !searchTerm || 
        table.table_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        table.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tables, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tables.map((t) => t.category).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [tables]);

  // Get columns for selected table
  const selectedTableColumns = useMemo(() => {
    if (!selectedTable) return [];
    return columns.filter((col) => col.table_name === selectedTable);
  }, [columns, selectedTable]);

  // Get relationships for selected table
  const selectedTableRelationships = useMemo(() => {
    if (!selectedTable) return [];
    return foreignKeys.filter((fk) => 
      fk.table_name === selectedTable || fk.foreign_table_name === selectedTable
    );
  }, [foreignKeys, selectedTable]);

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Core System': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Organization': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'AI System': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Marketplace': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'RAYANAVABRAIN': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'GOD Layer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Missions': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Annotations': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // Export functions
  const exportToJSON = () => {
    const exportData = {
      tables: filteredTables,
      columns: selectedTable ? selectedTableColumns : columns,
      foreignKeys: selectedTable ? selectedTableRelationships : foreignKeys,
      metadata: {
        totalTables: tables.length,
        totalColumns: columns.length,
        totalRelationships: foreignKeys.length,
        exportedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-schema-${selectedTable || 'all'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToSQL = () => {
    let sql = '-- Database Schema Export\n';
    sql += `-- Generated at: ${new Date().toISOString()}\n\n`;
    
    const tablesToExport = selectedTable 
      ? tables.filter((t) => t.table_name === selectedTable)
      : filteredTables;
    
    tablesToExport.forEach((table) => {
      sql += `-- Table: ${table.table_name}\n`;
      sql += `-- Category: ${table.category}\n`;
      sql += `-- Rows: ${table.row_count}\n\n`;
      
      const tableColumns = columns.filter((col) => col.table_name === table.table_name);
      if (tableColumns.length > 0) {
        sql += `CREATE TABLE ${table.table_name} (\n`;
        sql += tableColumns.map((col) => {
          let colDef = `  ${col.column_name} ${col.data_type}`;
          if (col.is_nullable === 'NO') colDef += ' NOT NULL';
          if (col.column_default) colDef += ` DEFAULT ${col.column_default}`;
          if (col.is_primary_key) colDef += ' PRIMARY KEY';
          return colDef;
        }).join(',\n');
        sql += '\n);\n\n';
      }
    });
    
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-schema-${selectedTable || 'all'}-${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (tablesError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2">Database Connection Error</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unable to connect to the database. Please check your connection settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tablesLoading || columnsLoading || foreignKeysLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Loading Database Schema</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing your database structure...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Schema Explorer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore and analyze your database with {tables.length} tables and {foreignKeys.length} relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToJSON} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={exportToSQL} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export SQL
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tables</p>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Table className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Columns</p>
                <p className="text-2xl font-bold">{columns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Relationships</p>
                <p className="text-2xl font-bold">{foreignKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Database Tables ({filteredTables.length})
                </span>
              </CardTitle>
              <CardDescription>
                Click on a table to view its structure and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTables.map((table) => (
                      <div
                        key={table.table_name}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedTable === table.table_name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedTable(table.table_name)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm truncate flex-1">
                              {table.table_name}
                            </h4>
                            {table.has_foreign_keys && (
                              <Link className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            )}
                          </div>
                          <Badge className={`${getCategoryColor(table.category)} text-xs`}>
                            {table.category || 'Uncategorized'}
                          </Badge>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {table.column_count} columns
                            </div>
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {table.row_count.toLocaleString()} rows
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTables.map((table) => (
                      <div
                        key={table.table_name}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedTable === table.table_name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedTable(table.table_name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <Database className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <h4 className="font-medium truncate">{table.table_name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {table.column_count} columns • {table.row_count.toLocaleString()} rows
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={`${getCategoryColor(table.category)} text-xs`}>
                              {table.category || 'Uncategorized'}
                            </Badge>
                            {table.has_foreign_keys && (
                              <Badge variant="outline" className="text-xs">
                                <Link className="h-3 w-3 mr-1" />
                                FK
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Table Details */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Table Details
              </CardTitle>
              <CardDescription>
                {selectedTable ? `Structure of ${selectedTable}` : 'Select a table to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                <Tabs defaultValue="columns" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="columns">
                      Columns ({selectedTableColumns.length})
                    </TabsTrigger>
                    <TabsTrigger value="relations">
                      Relations ({selectedTableRelationships.length})
                    </TabsTrigger>
                    <TabsTrigger value="annotations">
                      Annotations
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="columns" className="mt-4">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-2">
                        {selectedTableColumns.map((column, idx) => (
                          <div key={idx} className="p-3 border rounded-lg text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-medium flex items-center gap-2">
                                {column.is_primary_key && (
                                  <Key className="h-3 w-3 text-yellow-500" />
                                )}
                                {column.is_foreign_key && (
                                  <Link className="h-3 w-3 text-purple-500" />
                                )}
                                {column.column_name}
                              </span>
                              <div className="flex items-center gap-1">
                                {column.is_primary_key && (
                                  <Badge variant="outline" className="text-xs">PK</Badge>
                                )}
                                {column.is_foreign_key && (
                                  <Badge variant="outline" className="text-xs">FK</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="flex items-center gap-1">
                                <Type className="h-3 w-3" />
                                <span className="font-mono text-xs">{column.data_type}</span>
                              </div>
                              <div className="text-xs">
                                {column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}
                                {column.column_default && ` • Default: ${column.column_default}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="relations" className="mt-4">
                    <ScrollArea className="h-[350px]">
                      {selectedTableRelationships.length > 0 ? (
                        <div className="space-y-3">
                          {selectedTableRelationships.map((relation, idx) => (
                            <div key={idx} className="p-3 border rounded-lg text-sm">
                              <div className="font-medium mb-2 text-xs text-gray-500">
                                {relation.constraint_name}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="font-mono text-xs">
                                    {relation.table_name}.{relation.column_name}
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-mono text-xs">
                                    {relation.foreign_table_name}.{relation.foreign_column_name}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {relation.table_name === selectedTable ? 'References' : 'Referenced by'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Link className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 text-sm">No relationships found</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="annotations" className="mt-4">
                    <SimpleAnnotationPanel
                      targetType="table"
                      targetIdentifier={selectedTable}
                      targetName={selectedTable}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Select a table to view its details</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {tables.length} tables available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Relationship Summary */}
      {selectedTable && selectedTableRelationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Relationship Map
            </CardTitle>
            <CardDescription>
              Visual representation of table connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h3 className="font-medium text-lg">{selectedTable}</h3>
                  <p className="text-sm text-gray-500">Current Table</p>
                </div>
                
                {selectedTableRelationships.length > 0 && (
                  <>
                    <div className="flex justify-center">
                      <ChevronRight className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                      {Array.from(new Set(selectedTableRelationships.map((fk) => 
                        fk.table_name === selectedTable ? fk.foreign_table_name : fk.table_name
                      ))).map(tableName => (
                        <div
                          key={tableName}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedTable(tableName)}
                        >
                          <h4 className="font-medium text-sm truncate">{tableName}</h4>
                          <p className="text-xs text-gray-500">
                            {selectedTableRelationships.filter((fk) => 
                              (fk.table_name === selectedTable && fk.foreign_table_name === tableName) ||
                              (fk.foreign_table_name === selectedTable && fk.table_name === tableName)
                            ).length} connection(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}