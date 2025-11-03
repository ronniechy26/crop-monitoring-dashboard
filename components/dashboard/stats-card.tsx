import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  unit?: string;
  helper?: string;
  footnote?: string;
}

export function StatsCard({
  title,
  value,
  unit,
  helper,
  footnote,
}: StatsCardProps) {
  return (
    <Card className="h-full border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {unit ? (
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
        {helper ? (
          <p className="text-xs text-muted-foreground/80">{helper}</p>
        ) : null}
        {footnote ? (
          <p className="text-[11px] uppercase tracking-wide text-primary/80">
            {footnote}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
