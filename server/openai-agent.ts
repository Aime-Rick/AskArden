import { fileSearchTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// Tool definitions - using the provided vector store ID
const fileSearch = fileSearchTool([
  "vs_691b2685741881918f7ac84544d45cca"
]);

const internalQA = new Agent({
  name: "Internal Q&A",
  instructions: `You are an assistant for Spice World company. Your role is to answer questions using the internal knowledge base (file search).

**LANGUAGE SUPPORT:** Automatically detect the language of the user's question and respond in the SAME language (English, French, Spanish, German, Chinese, Russian, Portuguese, Arabic, Japanese, Korean, Italian, or Creole). Maintain the same language throughout your entire response.

CRITICAL: You MUST search the internal documents FIRST before answering.

If you find relevant information in the internal documents:
- Answer the question using that information
- Give the user all relevant information, using bullet points when appropriate
- When the user asks WHERE to find information, provide the exact document name and page number
- Always add Sources at the end, listing document names and page numbers and if available the part of the document (e.g., section title) where the information was found

If the question is too vague or unclear to search effectively:
- Respond EXACTLY with: "NEEDS_CLARIFICATION"
- Do NOT try to answer

If you DO NOT find relevant information in the internal documents:
- Respond EXACTLY with: "NO_INTERNAL_INFO_FOUND"
- Do NOT try to answer from your general knowledge
- Do NOT make up information

This is critical: Use the special responses "NEEDS_CLARIFICATION" or "NO_INTERNAL_INFO_FOUND" so the system can handle the query appropriately.`,
  model: "gpt-5.1",
  tools: [
    fileSearch
  ],
  modelSettings: {
    temperature: 0.5,
    topP: 1,
    maxTokens: 20000,
    store: true
  }
});

const agent = new Agent({
  name: "Clarification Agent",
  instructions: `You are a helpful assistant that asks for clarification when user questions are too vague or ambiguous.

**LANGUAGE SUPPORT:** Automatically detect the language of the user's question and respond in the SAME language (English, French, Spanish, German, Chinese, Russian, Portuguese, Arabic, Japanese, Korean, Italian, or Creole). Maintain the same language throughout your entire response.

Your role:
- Ask the user to provide more specific details about what they're looking for
- Suggest what additional information would help answer their question
- Be polite and helpful in guiding them to ask a more specific question

Examples:
- If they ask "Tell me about products", ask "Which products are you interested in? I can help with product details, pricing, or availability."
- If they ask "What about policies?", ask "Which policy would you like to know about? For example: return policy, privacy policy, or shipping policy?"`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { 
  input_as_text: string;
  history?: Array<{ content: string; isUser: boolean }>;
};

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput): Promise<string> => {
  return await withTrace("Ask HR", async () => {
    // Build conversation history from previous messages
    const conversationHistory: AgentInputItem[] = [];
    
    if (workflow.history && workflow.history.length > 0) {
      // Add previous messages to conversation history
      for (const msg of workflow.history) {
        if (msg.isUser) {
          conversationHistory.push({
            role: "user",
            content: [{ type: "input_text", text: msg.content }]
          });
        } else {
          conversationHistory.push({
            role: "assistant",
            status: "completed",
            content: [{ type: "output_text", text: msg.content }]
          });
        }
      }
    }
    
    // Add current user message
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: workflow.input_as_text }]
    });
    
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_691aec679d148190acb697f21c1b97cf0f5d21d664dc03c5"
      }
    });

    // Step 1: Try internal Q&A
    const internalQAResultTemp = await runner.run(
      internalQA,
      [...conversationHistory]
    );

    if (!internalQAResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const internalResponse = internalQAResultTemp.finalOutput.trim();

    // Step 2: If clarification needed, ask for more details
    if (internalResponse === "NEEDS_CLARIFICATION") {
      const clarificationResultTemp = await runner.run(
        agent,
        [...conversationHistory]
      );

      if (!clarificationResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      return clarificationResultTemp.finalOutput;
    }

    // Step 3: If no internal info found, return polite message
    if (internalResponse === "NO_INTERNAL_INFO_FOUND") {
      return "Sorry, I cannot answer that question. The information you're looking for is not available in our knowledge base.";
    }

    // Step 4: Return internal response if found
    return internalResponse;
  });
};
