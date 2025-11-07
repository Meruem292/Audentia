
import { getAdminTransactionsAction } from "@/lib/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function AdminHistoryPage() {
  const { data: transactions, error } = await getAdminTransactionsAction();

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }
  
  if (!transactions || transactions.length === 0) {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">A record of all user points activity.</p>
            </div>
            <div className="border rounded-lg p-8 text-center">
                <p>No transactions found.</p>
            </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">A record of all user points activity.</p>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {new Date(tx.timestamp).toLocaleDateString("en-US", {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>{tx.userId}</TableCell>
                <TableCell>
                  <Badge variant={tx.transactionType === 'BOTTLE_INSERTION' ? 'default' : 'secondary'}>
                    {tx.transactionType.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{tx.details}</TableCell>
                <TableCell className={cn("text-right font-medium", tx.pointsChange > 0 ? 'text-primary' : 'text-destructive')}>
                    {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
