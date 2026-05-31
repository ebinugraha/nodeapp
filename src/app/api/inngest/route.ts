import { serve } from "inngest/next";
import {
  executeWorkflow,
  pollYoutubeLiveChat,
  pollYoutubeVideoComments,
} from "@/inngest/functions";
import { inngest } from "../../../inngest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    executeWorkflow,
    pollYoutubeLiveChat,
    pollYoutubeVideoComments,
  ],
});
