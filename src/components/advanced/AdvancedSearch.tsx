
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Search, Filter, X, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface SearchFilters {
  searchTerm: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  category: string;
  status: string;
  amountRange: {
    min?: number;
    max?: number;
  };
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    dateRange: {},
    category: '',
    status: '',
    amountRange: {}
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
    toast.success('Search applied successfully');
  };

  const handleClear = () => {
    setFilters({
      searchTerm: '',
      dateRange: {},
      category: '',
      status: '',
      amountRange: {}
    });
    onClear();
    toast.info('Filters cleared');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    return count;
  };

  return (
    <Card className="glass-card border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text">Advanced Search & Filters</CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="border-slate-600 text-slate-300"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search across all data..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date From
              </label>
              <DatePicker
                date={filters.dateRange.from}
                setDate={(date) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: date }
                }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Date To</label>
              <DatePicker
                date={filters.dateRange.to}
                setDate={(date) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: date }
                }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Min Amount
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.amountRange.min || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, min: Number(e.target.value) || undefined }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Max Amount</label>
              <Input
                type="number"
                placeholder="999999"
                value={filters.amountRange.max || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, max: Number(e.target.value) || undefined }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <Button onClick={handleSearch} className="modern-button flex-1">
            <Search className="mr-2 h-4 w-4" />
            Apply Search
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-slate-600 text-slate-300">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-blue-500/20 border-blue-500/30 text-blue-400"
            onClick={() => setFilters(prev => ({ ...prev, dateRange: { from: new Date() } }))}
          >
            Today
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-purple-500/20 border-purple-500/30 text-purple-400"
            onClick={() => {
              const lastWeek = new Date();
              lastWeek.setDate(lastWeek.getDate() - 7);
              setFilters(prev => ({ ...prev, dateRange: { from: lastWeek, to: new Date() } }));
            }}
          >
            Last 7 days
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-teal-500/20 border-teal-500/30 text-teal-400"
            onClick={() => {
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              setFilters(prev => ({ ...prev, dateRange: { from: lastMonth, to: new Date() } }));
            }}
          >
            Last 30 days
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-green-500/20 border-green-500/30 text-green-400"
            onClick={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
          >
            Completed only
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
