import { Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrustBadgeProps {
  status: "verified" | "pending" | "revoked";
  blockchainHash?: string;
  tooltipText?: string;
}

export default function TrustBadge({
  status,
  blockchainHash,
  tooltipText,
}: TrustBadgeProps) {
  const configs = {
    verified: {
      icon: CheckCircle,
      label: "Blockchain Verified",
      variant: "default" as const,
      className: "bg-accent text-accent-foreground border-accent-border",
    },
    pending: {
      icon: Clock,
      label: "Pending Verification",
      variant: "secondary" as const,
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    revoked: {
      icon: XCircle,
      label: "Revoked",
      variant: "secondary" as const,
      className: "bg-muted text-muted-foreground border-muted-border",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={config.variant}
          className={`${config.className} cursor-help gap-1.5`}
          data-testid={`badge-trust-${status}`}
        >
          <Shield className="h-3.5 w-3.5" />
          <Icon className="h-3.5 w-3.5" />
          <span className="font-medium">{config.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="mb-1 font-medium">
          {tooltipText ?? "Consent recorded on blockchain"}
        </p>
        {blockchainHash && (
          <p className="text-muted-foreground font-mono text-xs break-all">
            Hash: {blockchainHash}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
