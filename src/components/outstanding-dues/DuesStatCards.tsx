
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type DuesStatsProps = {
  totalOutstanding: number;
  duesData: any[];
  totalOverdue: number;
  criticalAccounts: number;
  averageOutstanding: number;
};

export const DuesStatCards = ({
  totalOutstanding,
  duesData,
  totalOverdue,
  criticalAccounts,
  averageOutstanding
}: DuesStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Across {duesData.length} customers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Overdue (&gt;30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalOverdue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {((totalOverdue / totalOutstanding) * 100).toFixed(1)}% of total outstanding
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Critical Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalAccounts}</div>
          <p className="text-xs text-muted-foreground">
            Customers with dues &gt;90 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{averageOutstanding.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Per customer with dues
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
