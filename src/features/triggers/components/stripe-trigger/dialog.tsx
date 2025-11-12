import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            User this webhook URL to connect your Stripe to this trigger.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant={"outline"}
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Setup instruction</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your Stripe Dashboard</li>
                <li>Go to developers {">"} webhooks</li>
                <li>Click add endpoint</li>
                <li>Paste the webhook URL above</li>
                <li>
                  Select events to listen for (e.g., payment_intent.succeded)
                </li>
                <li>Save and copy the signing secret</li>
              </ol>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Avaible variables</h4>
              <ul className="text-xs text-muted-foreground">
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    - Payment amount
                  </code>
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    - Currency
                  </code>
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    - Customer ID
                  </code>
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    - Stripe Event (payment_intent.succeded)
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
