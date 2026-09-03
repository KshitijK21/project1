export interface AiQueryResult {
  question: string;
  generated_sql: string;
  result: Record<string, unknown>[];
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
}
