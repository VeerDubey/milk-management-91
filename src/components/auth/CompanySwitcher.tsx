
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserCompany } from '@/types/auth';
import { Building2, ChevronDown, Check, Loader2 } from 'lucide-react';

interface CompanySwitcherProps {
  companies: UserCompany[];
  currentCompany: UserCompany | null;
  onCompanySwitch: (companyId: string) => Promise<void>;
  className?: string;
}

export const CompanySwitcher: React.FC<CompanySwitcherProps> = ({
  companies,
  currentCompany,
  onCompanySwitch,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCompanySwitch = async (companyId: string) => {
    if (currentCompany?.id === companyId) return;
    
    setIsLoading(true);
    try {
      await onCompanySwitch(companyId);
    } finally {
      setIsLoading(false);
    }
  };

  if (!companies.length) return null;

  if (companies.length === 1) {
    // Single company - show as badge
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {currentCompany?.name}
        </span>
        <Badge variant="outline" className="text-xs">
          {currentCompany?.role}
        </Badge>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-between min-w-[200px] ${className}`}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentCompany?.name || 'Select Company'}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[250px]" align="start">
        <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            className="cursor-pointer"
            onClick={() => handleCompanySwitch(company.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="h-6 w-6 rounded"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-gray-500" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {company.role}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {company.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
                {currentCompany?.id === company.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
