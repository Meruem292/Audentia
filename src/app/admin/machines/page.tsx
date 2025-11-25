
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { MachineList } from "@/components/admin/machine-list";

export default function AdminMachinesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Machine Management</CardTitle>
                <CardDescription>View and manage all reverse vending machines.</CardDescription>
            </CardHeader>
            <CardContent>
                <MachineList />
            </CardContent>
        </Card>
    );
}
