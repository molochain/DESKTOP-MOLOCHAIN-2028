import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  services?: any[];
  categories?: any[];
  onSelectService?: (service: any) => void;
}

export function ServiceSearch({ value, onChange, placeholder = "Search services..." }: ServiceSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}