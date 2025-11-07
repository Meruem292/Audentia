
import { getTransactionsAction } from "@/lib/actions";
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
import type { Transaction } from "@/lib/types";

export default async function HistoryPage() {
  const { data: transactions, error } = await getTransactionsAction();

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }
  
  if (!transactions || transactions.length === 0) {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">A record of your points activity.</p>
            </div>
            <div className="border rounded-lg p-8 text-center">
                <p>No transactions found.</p>
            </div>
      </div>
    )
  }

  const getTransactionType = (tx: Transaction) => {
    if (tx.pointsEarned && tx.pointsEarned > 0) return { label: 'BOTTLE INSERTION', variant: 'default' } as const;
    if (tx.pointsUsed && tx.pointsUsed > 0) return { label: 'REWARD DISPENSE', variant: 'secondary' } as const;
    return { label: 'SYSTEM', variant: 'outline' } as const;
  }
  
  const getTransactionDetails = (tx: Transaction) => {
     if (tx.details) return tx.details;
     if (tx.plasticBottleCount) return `Bottles: ${tx.plasticBottleCount}`;
     if (tx.pointsUsed) return `Dispenser: ${tx.dispenserIndex}, Cost: ${tx.pointsUsed} pts`;
     return 'N/A';
  }
  
  const getPointsChange = (tx: Transaction) => {
    if (tx.pointsEarned) return tx.pointsEarned;
    if (tx.pointsUsed) return -tx.pointsUsed;
    return 0;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">A record of your points activity.</p>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const type = getTransactionType(tx);
              const pointsChange = getPointsChange(tx);
              return (
              <TableRow key={tx.id}>
                <TableCell>
                  <Badge variant={type.variant}>
                    {type.label.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{getTransactionDetails(tx)}</TableCell>
                <TableCell>
                    <Badge variant={tx.status === 'valid' || tx.status === 'dispensed' ? 'default' : 'destructive'}>
                        {tx.status}
                    </Badge>
                </TableCell>
                <TableCell className={cn("text-right font-medium", pointsChange > 0 ? 'text-primary' : 'text-destructive')}>
                    {pointsChange > 0 ? '+' : ''}{pointsChange.toLocaleString()}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
