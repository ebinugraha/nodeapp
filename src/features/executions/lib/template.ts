import type { workflowContext } from "@/features/executions/type";

/**
 * Compiles template strings with context variables.
 * Supports patterns like:
 * - {{YOUTUBE_LIVE_CHAT.message}}

 * - {{variableName.nestedProperty}}
 *
 * Also supports legacy patterns:
 * - {{author}}
 * - {{comment}}
 * - {{videoId}}
 */
export function compileTemplate(
  template: string | undefined,
  context: workflowContext,
): string {
  if (!template) return "";

  let result = template;

  // Handle nested context variables like {{YOUTUBE_LIVE_CHAT.raw.authorDetails.displayName}}
  const nestedPattern = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z0-9_.]+)\s*\}\}/g;
  let match;

  while ((match = nestedPattern.exec(template)) !== null) {
    const [fullMatch, contextKey, propertyPath] = match;
    const value = context[contextKey];
    if (typeof value === "object" && value !== null) {
      const keys = propertyPath.split(".");
      let current: any = value;
      for (const key of keys) {
        if (current && typeof current === "object") {
          current = current[key];
        } else {
          current = undefined;
          break;
        }
      }
      result = result.replace(fullMatch, current !== undefined && current !== null ? String(current) : "");
    } else {
      result = result.replace(fullMatch, "");
    }
  }

  // Handle top-level context variables like {{variableName}}
  const topLevelPattern = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
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
    (context.YOUTUBE_LIVE_CHAT as Record<string, unknown> | undefined);

  if (commentData) {
    result = result.replace(
      /\{\{author\}\}/g,
      String(commentData.author ?? ""),
    );
    result = result.replace(
      /\{\{comment\}\}/g,
      String(commentData.text ?? commentData.message ?? ""),
    );
    result = result.replace(
      /\{\{videoId\}\}/g,
      String(commentData.videoId ?? ""),
    );
  }

  return result;
}

/**
 * Extracts all variable references from a template string.
 * Useful for debugging or validation.
 */
export function extractTemplateVariables(template: string): {
  nested: string[];
  topLevel: string[];
} {
  const nested: string[] = [];
  const topLevel: string[] = [];

  const nestedMatches = template.matchAll(
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z0-9_.]+)\s*\}\}/g,
  );
  for (const match of nestedMatches) {
    nested.push(match[1]);
  }

  const topLevelMatches = template.matchAll(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g);
  for (const match of topLevelMatches) {
    topLevel.push(match[1]);
  }

  return { nested, topLevel };
}
