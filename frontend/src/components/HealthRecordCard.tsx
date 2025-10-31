import { FileText, Calendar, Building2, Lock, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TrustBadge from "./TrustBadge";

interface HealthRecordCardProps {
  id: string;
  type: "lab" | "prescription" | "scan" | "consultation";
  title: string;
  date: string;
  hospital: string;
  summary: string;
  details?: string;
  isEncrypted?: boolean;
}

export default function HealthRecordCard({
  id,
  type,
  title,
  date,
  hospital,
  summary,
  details,
  isEncrypted = true,
}: HealthRecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeConfigs = {
    lab: { color: "bg-blue-500", label: "Lab Report", icon: FileText },
    prescription: { color: "bg-green-500", label: "Prescription", icon: FileText },
    scan: { color: "bg-purple-500", label: "Scan", icon: FileText },
    consultation: { color: "bg-amber-500", label: "Consultation", icon: FileText },
  };

  const config = typeConfigs[type];
  const Icon = config.icon;

  return (
    <Card className="hover-elevate" data-testid={`card-health-record-${id}`}>
      <div className={`h-1 ${config.color} rounded-t-xl`} />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`${config.color} p-2 rounded-lg text-white mt-0.5`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-medium mb-1">{title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {hospital}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{summary}</p>

        {details && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 h-8"
              data-testid={`button-expand-${id}`}
            >
              <span>View Details</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </Button>
            {isExpanded && (
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{details}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {isEncrypted && (
              <Badge variant="outline" className="gap-1.5">
                <Lock className="h-3 w-3" />
                <span className="text-xs">Encrypted</span>
              </Badge>
            )}
          </div>
          <TrustBadge status="verified" blockchainHash={`0x${id}`} />
        </div>
      </CardContent>
    </Card>
  );
}
