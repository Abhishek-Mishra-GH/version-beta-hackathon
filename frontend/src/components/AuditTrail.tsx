import { CheckCircle, Eye, XCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditEvent {
  id: string;
  timestamp: string;
  action: "granted" | "accessed" | "revoked";
  actor: string;
  actorId: string;
  dataAccessed?: string[];
  blockchainHash: string;
}

interface AuditTrailProps {
  events: AuditEvent[];
}

export default function AuditTrail({ events }: AuditTrailProps) {
  const actionConfigs = {
    granted: {
      icon: CheckCircle,
      label: "Consent Granted",
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    },
    accessed: {
      icon: Eye,
      label: "Data Accessed",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    revoked: {
      icon: XCircle,
      label: "Consent Revoked",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  };

  const copyHash = (hash: string) => {
    void navigator.clipboard.writeText(hash);
    console.log("Hash copied:", hash);
  };

  return (
    <Card data-testid="card-audit-trail">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Immutable Audit Trail
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Blockchain-verified record of all consent actions
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="bg-border absolute top-0 bottom-0 left-5 w-px" />
          <div className="space-y-6">
            {events.map((event) => {
              const config = actionConfigs[event.action];
              const Icon = config.icon;

              return (
                <div key={event.id} className="relative pl-12">
                  <div
                    className={`absolute left-0 ${config.bgColor} rounded-full p-2`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{config.label}</p>
                        <p className="text-muted-foreground text-xs">
                          {event.timestamp}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.action}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        By:{" "}
                        <span className="text-foreground font-medium">
                          {event.actor}
                        </span>
                        <span className="ml-2 font-mono text-xs">
                          ({event.actorId})
                        </span>
                      </p>
                      {event.dataAccessed && (
                        <p className="text-muted-foreground">
                          Data: {event.dataAccessed.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHash(event.blockchainHash)}
                      className="h-7 gap-2 font-mono text-xs"
                      data-testid={`button-copy-hash-${event.id}`}
                    >
                      <span className="max-w-[200px] truncate">
                        {event.blockchainHash}
                      </span>
                      <span className="text-muted-foreground">📋</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
