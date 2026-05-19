import { workflowContext } from "@/features/executions/type";

/**
 * Compiles template strings with context variables.
 * Supports patterns like:
 * - {{YOUTUBE_LIVE_CHAT.message}}
 * - {{YOUTUBE_VIDEO_COMMENT.author}}
 * - {{variableName.nestedProperty}}
 *
 * Also supports legacy patterns:
 * - {{author}}
 * - {{comment}}
 * - {{videoId}}
 */
export function compileTemplate(
  template: string | undefined,
  context: workflowContext
): string {
  if (!template) return "";

  let result = template;

  // Handle nested context variables like {{YOUTUBE_LIVE_CHAT.message}}
  // Match patterns like {{contextKey.property}} or {{contextKey}}
  const nestedPattern = /\{\{([A-Z_][A-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  let match;

  while ((match = nestedPattern.exec(template)) !== null) {
    const [fullMatch, contextKey, property] = match;
    const value = context[contextKey];
    if (typeof value === "object" && value !== null) {
      const nestedValue = (value as Record<string, unknown>)[property];
      result = result.replace(fullMatch, String(nestedValue ?? ""));
    } else {
      result = result.replace(fullMatch, "");
    }
  }

  // Handle top-level context variables like {{variableName}}
  const topLevelPattern = /\{\{([A-Z_][A-Z0-9_]*)\}\}/g;
  while ((match = topLevelPattern.exec(template)) !== null) {
    const [fullMatch, key] = match;
    const value = context[key];
    if (value !== undefined && value !== null) {
      if (typeof value === "object") {
        result = result.replace(fullMatch, JSON.stringify(value));
      } else {
        result = result.replace(fullMatch, String(value));
      }
    }
  }

  // Legacy patterns for YouTube comment data
  const commentData =
    (context.YOUTUBE_VIDEO_COMMENT as Record<string, unknown> | undefined) ||
    (context.YOUTUBE_LIVE_CHAT as Record<string, unknown> | undefined);

  if (commentData) {
    result = result.replace(/\{\{author\}\}/g, String(commentData.author ?? ""));
    result = result.replace(
      /\{\{comment\}\}/g,
      String(commentData.text ?? commentData.message ?? "")
    );
    result = result.replace(
      /\{\{videoId\}\}/g,
      String(commentData.videoId ?? "")
    );
  }

  return result;
}

/**
 * Extracts all variable references from a template string.
 * Useful for debugging or validation.
 */
export function extractTemplateVariables(
  template: string
): { nested: string[]; topLevel: string[] } {
  const nested: string[] = [];
  const topLevel: string[] = [];

  const nestedMatches = template.matchAll(
    /\{\{([A-Z_][A-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g
  );
  for (const match of nestedMatches) {
    nested.push(match[1]);
  }

  const topLevelMatches = template.matchAll(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g);
  for (const match of topLevelMatches) {
    topLevel.push(match[1]);
  }

  return { nested, topLevel };
}