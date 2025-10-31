import { Calendar, User, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrustBadge from "./TrustBadge";

interface ConsentCardProps {
  id: string;
  doctorName: string;
  doctorId: string;
  hospital: string;
  purpose: string;
  dataTypes: string[];
  grantedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "revoked";
  onRevoke?: () => void;
}

export default function ConsentCard({
  id,
  doctorName,
  doctorId,
  hospital,
  purpose,
  dataTypes,
  grantedDate,
  expiryDate,
  status,
  onRevoke,
}: ConsentCardProps) {
  const isActive = status === "active";
  const trustStatus = status === "active" ? "verified" : "revoked";

  return (
    <Card
      className={`${isActive ? "hover-elevate" : "opacity-75"}`}
      data-testid={`card-consent-${id}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium mb-2">{purpose}</CardTitle>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>
                  {doctorName} <span className="font-mono text-xs">({doctorId})</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                <span>{hospital}</span>
              </div>
            </div>
          </div>
          <TrustBadge status={trustStatus} blockchainHash={`0x${id}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Shared Data Types:
          </p>
          <div className="flex flex-wrap gap-2">
            {dataTypes.map((type, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Granted: {grantedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Expires: {expiryDate}</span>
          </div>
        </div>

        {isActive && onRevoke && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onRevoke}
            className="w-full"
            data-testid={`button-revoke-${id}`}
          >
            Revoke Consent
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
