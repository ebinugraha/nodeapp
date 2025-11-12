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
import { generateGoogleFormScript } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            User this webhook URL to connect your Google Form to this trigger.
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
                <li>Open your google form</li>
                <li>Click the three dots menu {">"} script editor</li>
                <li>Copy and paste the script below</li>
                <li>Replace WEBHOOK_URL with your webhook URL above</li>
                <li>Save and click "Triggers" {">"} add Triggger</li>
                <li>
                  Choose: Form form {">"} on form submit {">"} save
                </li>
              </ol>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h4 className="font-medium text-sm">Google apps script</h4>
              <Button
                type="button"
                variant={"outline"}
                onClick={async () => {
                  const script = generateGoogleFormScript(webhookUrl);
                  await copyToClipboard(script);
                }}
              >
                <CopyIcon className="size-4 mr-2" />
                Copy Google Apps Script
              </Button>
              <p className="text-xs text-muted-foreground">
                this script includes the necessary code to send form responses
                to
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Avaible variables</h4>
              <ul className="text-xs text-muted-foreground">
                <li>- Respondent's email</li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{googleForm.responses['Question Name']}}"}
                  </code>
                  - Specific Answer
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{jsoin googleForm.responses}}"}
                  </code>
                  - All response as JSON
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
