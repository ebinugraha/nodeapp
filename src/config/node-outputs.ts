import { NodeType } from "@prisma/client";

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
  [NodeType.GAMBLING_CHECKER]: [
    { key: "isGambling", label: "Is Gambling? (True/False)" },
    { key: "prediction", label: "Prediction (1/0)" },
    { key: "label", label: "Label Text" },
    { key: "confidence", label: "Confidence (%)" },
  ],
  [NodeType.SENTIMENT_ANALYSIS]: [
    { key: "label", label: "Sentiment Label (positive/negative/neutral)" },
    { key: "score", label: "Score (-1 to 1)" },
    { key: "confidence", label: "Confidence (0 to 1)" },
    { key: "emotions.joy", label: "Joy Score" },
    { key: "emotions.anger", label: "Anger Score" },
    { key: "emotions.sadness", label: "Sadness Score" },
    { key: "emotions.surprise", label: "Surprise Score" },
  ],
  [NodeType.SPAM_DETECTION]: [
    { key: "isSpam", label: "Is Spam? (True/False)" },
    { key: "reasons", label: "Spam Reasons List" },
    { key: "scores.links", label: "Links Spam Score" },
    { key: "scores.repeatedChars", label: "Repeated Chars Score" },
    { key: "scores.capsLock", label: "Caps Lock Score" },
  ],

  // --- INTEGRATIONS ---
  [NodeType.DISCORD_NOTIFY]: [
    { key: "messageContent", label: "Sent Message Content" },
  ],
  [NodeType.SLACK]: [{ key: "messageContent", label: "Sent Message Content" }],
  [NodeType.YOUTUBE_DELETE_CHAT]: [
    { key: "success", label: "Success Status" },
    { key: "deletedId", label: "Deleted Message ID" },
  ],
  [NodeType.YOUTUBE_PIN]: [
    { key: "success", label: "Success Status" },
    { key: "commentId", label: "Comment ID" },
  ],
  [NodeType.WAIT_DELAY]: [
    { key: "completed", label: "Completion Status" },
    { key: "delaySeconds", label: "Actual Delay in Seconds" },
  ],
  [NodeType.YOUTUBE_REPLY]: [
    { key: "success", label: "Success Status" },
    { key: "replyId", label: "Reply ID" },
    { key: "replyText", label: "Reply Text" },
  ],
  [NodeType.YOUTUBE_TIMEOUT]: [
    { key: "success", label: "Success Status" },
    { key: "banId", label: "Ban ID" },
    { key: "expiresAt", label: "Expires At" },
  ],
  [NodeType.WEBHOOK]: [
    { key: "success", label: "Success Status" },
    { key: "status", label: "HTTP Status Code" },
    { key: "response", label: "Response JSON Data" },
  ],

  // --- GOOGLE SHEETS (Yang baru kita buat) ---
  [NodeType.GOOGLE_SHEETS]: [
    { key: "values", label: "Read: Rows Data" },
    { key: "updates", label: "Append: Update Info" },
    { key: "success", label: "Success Status" },
  ],
};
