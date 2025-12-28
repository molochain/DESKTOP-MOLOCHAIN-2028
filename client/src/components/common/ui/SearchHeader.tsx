import { ReactNode, ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
  testId?: string;
}

export function SearchHeader({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
  className,
  testId = "search-header",
}: SearchHeaderProps) {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
        className
      )}
      data-testid={testId}
    >
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
            data-testid={`${testId}-search`}
          />
        </div>
        {filters && (
          <div
            className="flex flex-wrap gap-2"
            data-testid={`${testId}-filters`}
          >
            {filters}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2" data-testid={`${testId}-actions`}>
          {actions}
        </div>
      )}
    </div>
  );
}
