import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CropMetrics } from "@/lib/crop-data";

interface CropDataTableProps {
  metrics: CropMetrics;
}

export function CropDataTable({ metrics }: CropDataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead>Field block</TableHead>
            <TableHead>Area (ha)</TableHead>
            <TableHead>Yield (t/ha)</TableHead>
            <TableHead>Soil moisture</TableHead>
            <TableHead>NDVI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.table.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-foreground">
                {row.name}
              </TableCell>
              <TableCell>{row.area.toFixed(0)}</TableCell>
              <TableCell>{row.yield.toFixed(1)}</TableCell>
              <TableCell>{(row.moisture * 100).toFixed(0)}%</TableCell>
              <TableCell>{row.ndvi.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
