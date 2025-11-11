import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CropMetrics } from "@/types/crop";

interface CropDataTableProps {
  metrics: CropMetrics;
}

export function CropDataTable({ metrics }: CropDataTableProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <div className="hidden w-full overflow-x-auto md:block">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Field block</TableHead>
              <TableHead>Barangay</TableHead>
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
                <TableCell>{row.barangay}</TableCell>
                <TableCell>{row.area.toFixed(0)}</TableCell>
                <TableCell>{row.yield.toFixed(1)}</TableCell>
                <TableCell>{(row.moisture * 100).toFixed(0)}%</TableCell>
                <TableCell>{row.ndvi.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 p-4 text-sm md:hidden">
        {metrics.table.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-border/60 bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-foreground">{row.name}</p>
              <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {row.barangay}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Area</dt>
                <dd className="font-semibold text-foreground">
                  {row.area.toFixed(0)} ha
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Yield</dt>
                <dd className="font-semibold text-foreground">
                  {row.yield.toFixed(1)} t/ha
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Soil moisture
                </dt>
                <dd className="font-semibold text-foreground">
                  {(row.moisture * 100).toFixed(0)}%
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">NDVI</dt>
                <dd className="font-semibold text-foreground">
                  {row.ndvi.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
