import { NodeType } from "@/generated/prisma";

export type VariableDefinition = {
  key: string;
  label: string;
  icon?: any;
};

export const NODE_OUTPUTS: Partial<Record<NodeType, VariableDefinition[]>> = {
  // --- TRIGGERS ---
  [NodeType.MANUAL_TRIGGER]: [
    { key: "data", label: "Payload Data (JSON)" },
    { key: "id", label: "Execution ID" },
    { key: "user", label: "User Info" },
  ],
  [NodeType.YOUTUBE_VIDEO_COMMENT]: [
    { key: "text", label: "Comment Text" },
    { key: "author", label: "Author Name" },
    { key: "publishedAt", label: "Publish Date" },
    { key: "commentId", label: "Comment ID" },
    { key: "raw", label: "Full Raw Data (JSON)" },
  ],
  [NodeType.YOUTUBE_LIVE_CHAT]: [
    { key: "message", label: "Chat Message" },
    { key: "author", label: "Author Name" },
    { key: "publishedAt", label: "Time" },
    { key: "raw", label: "Full Raw Data" },
  ],
  [NodeType.GOOGLE_FORM_TRIGGER]: [
    { key: "respondentEmail", label: "Respondent Email" },
    { key: "responses", label: "Form Responses (JSON)" },
    { key: "timestamp", label: "Submission Time" },
  ],
  [NodeType.STRIPE_TRIGGER]: [
    { key: "id", label: "Event ID" },
    { key: "type", label: "Event Type (e.g., payment_intent.succeeded)" },
    { key: "data", label: "Data Object" },
    { key: "created", label: "Created At" },
    { key: "livemode", label: "Live Mode (True/False)" },
  ],

  // --- ACTIONS ---
  [NodeType.HTTP_REQUEST]: [
    { key: "httpResponse.data", label: "Response Data (JSON/Text)" },
    { key: "httpResponse.status", label: "Status Code (e.g., 200)" },
    { key: "httpResponse.statusText", label: "Status Text (e.g., OK)" },
  ],
  [NodeType.DECISION]: [
    { key: "result", label: "Result (True/False)" },
    { key: "value", label: "Checked Value" },
  ],

  // --- AI MODELS ---
  [NodeType.GEMINI]: [{ key: "text", label: "Generated Text" }],
  [NodeType.OPENAI]: [{ key: "text", label: "Generated Text" }],
  [NodeType.ANTHROPIC]: [{ key: "text", label: "Generated Text" }],
  [NodeType.DEEPSEEK]: [{ key: "text", label: "Generated Text" }],

  // --- INTEGRATIONS ---
  [NodeType.DISCORD]: [
    { key: "messageContent", label: "Sent Message Content" },
  ],
  [NodeType.SLACK]: [{ key: "messageContent", label: "Sent Message Content" }],
  [NodeType.YOUTUBE_DELETE_CHAT]: [
    { key: "success", label: "Success Status" },
    { key: "deletedId", label: "Deleted Message ID" },
  ],

  // --- GOOGLE SHEETS (Yang baru kita buat) ---
  [NodeType.GOOGLE_SHEETS]: [
    { key: "values", label: "Read: Rows Data" },
    { key: "updates", label: "Append: Update Info" },
    { key: "success", label: "Success Status" },
  ],
};
