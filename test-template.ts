import { compileTemplate } from "./src/features/executions/lib/template";

const context = {
  YOUTUBE_LIVE_CHAT: {
    snippet: {
      displayMessage: "Mantap"
    },
    raw: {
      authorDetails: {
        displayName: "John Doe"
      }
    }
  }
};

const template = "Author: {{YOUTUBE_LIVE_CHAT.raw.authorDetails.displayName}}\nComment: {{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}";

console.log("Result:");
console.log(compileTemplate(template, context));
