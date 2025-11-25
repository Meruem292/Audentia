
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const machines = [
    { id: "M001", location: "Downtown Plaza", status: "Online", bottlesCollected: 1205 },
    { id: "M002", location: "Central Park", status: "Online", bottlesCollected: 850 },
    { id: "M003", location: "University Campus", status: "Offline", bottlesCollected: 2100 },
    { id: "M004", location: "Westside Mall", status: "Online", bottlesCollected: 980 },
    { id: "M005", location: "North Station", status: "Maintenance", bottlesCollected: 560 },
];

export function MachineList() {
    const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
        switch (status) {
            case "Online": return "default";
            case "Offline": return "destructive";
            case "Maintenance": return "secondary";
            default: return "outline";
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Machine ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Bottles Collected (All Time)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {machines.map((machine) => (
                    <TableRow key={machine.id}>
                        <TableCell className="font-medium">{machine.id}</TableCell>
                        <TableCell>{machine.location}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(machine.status)}>{machine.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{machine.bottlesCollected.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
