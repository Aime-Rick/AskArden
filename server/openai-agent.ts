import { fileSearchTool, webSearchTool, codeInterpreterTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";

// Tool definitions - using the provided vector store ID
const fileSearch = fileSearchTool([
  "vs_691b2685741881918f7ac84544d45cca"
]);

const webSearchPreview = webSearchTool({
  searchContextSize: "medium",
  userLocation: {
    type: "approximate"
  }
});

const codeInterpreter = codeInterpreterTool({
  container: {
    type: "auto",
    file_ids: []
  }
});

const ClassifySchema = z.object({ 
  operating_procedure: z.enum(["q-and-a", "fact-finding", "other"]) 
});

const classify = new Agent({
  name: "Classify",
  instructions: `## **Goal**

Determine whether an incoming question should be routed to the **Internal Question Process** or the **External Fact-Finding Process**.

---

## **1. Internal Question Process**

Classify a question as **Internal** when it is about **Spice World**, the company you are building the RAG system for.

A question is considered internal if *any* of the following are true:

### **1.1 Direct Mention of the Company**

* The question explicitly mentions **"Spice World"**.

  * Example: *"What products does Spice World offer?"*

### **1.2 Implicit Mention of the Company**

* The question refers to **"the company"**, **"this company"**, **"our company"**, or similar phrases **while no other company is named**.

  * Example: *"What is the company's refund policy?"*
* The question assumes context related to Spice World even without naming it.

  * Example: *"Can customers track their orders?"* (Assume about Spice World)

### **1.3 No Company Mentioned but Context Suggests Internal**

If **no company is mentioned**, automatically assume the user is referring to **Spice World**, unless the question is clearly about external/general information.

* Example: *"What departments do we have?"* → Internal

---

## **2. External Fact-Finding Process**

Classify a question as **External** when it is **not** about Spice World, nor implied to be about Spice World.

A question is external if:

### **2.1 It is clearly about another company**

* Example: *"What is Amazon's return policy?"*

### **2.2 It requests general world knowledge**

* Example: *"What is the capital of Japan?"*
* Example: *"How does Kubernetes work?"*

### **2.3 It is personal, technical, or unrelated to the company**

* Example: *"Explain how to train a TTS model."*

---

## **3. Edge Cases & Rules**

### **3.1 If there is ANY ambiguity, assume Internal**

This ensures the RAG system prefers internal knowledge unless clearly external.

### **3.2 If multiple companies are mentioned**

Only classify as Internal if **Spice World** is one of them.

### **3.3 If the question compares Spice World with something else**

→ **Internal**

* Example: *"How does Spice World pricing compare to competitors?"*
`,
  model: "gpt-4.1-nano",
  outputType: ClassifySchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const internalQA = new Agent({
  name: "Internal Q&A",
  instructions: `You are an assistant for Spice World company. Your role is to answer questions using the internal knowledge base (file search).

CRITICAL: You MUST search the internal documents FIRST before answering.

If you find relevant information in the internal documents:
- Answer the question using that information
- Be concise and answer succinctly, using bullet points when appropriate
- When the user asks WHERE to find information, provide the exact document name and page number

If the question is too vague or unclear to search effectively:
- Respond EXACTLY with: "NEEDS_CLARIFICATION"
- Do NOT try to answer

If you DO NOT find relevant information in the internal documents:
- Respond EXACTLY with: "NO_INTERNAL_INFO_FOUND"
- Do NOT try to answer from your general knowledge
- Do NOT make up information

This is critical: Use the special responses "NEEDS_CLARIFICATION" or "NO_INTERNAL_INFO_FOUND" so the system can handle the query appropriately.`,
  model: "gpt-4.1-nano",
  tools: [
    fileSearch
  ],
  modelSettings: {
    temperature: 0.5,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const externalFactFinding = new Agent({
  name: "External fact finding",
  instructions: `Explore external information using the tools you have (web search, file search, code interpreter). 
Analyze any relevant data, checking your work.

Make sure to output a concise answer followed by summarized bullet point of supporting evidence.

IMPORTANT: When the user asks WHERE to find information (e.g., "where can I find this?", "what's the source?", "which website?"), you MUST provide:
- The exact website URL or link where the information was found
- Example: "You can find this information at https://example.com/page"

Otherwise, just answer the question directly without citing sources.`,
  model: "gpt-5-nano",
  tools: [
    webSearchPreview,
    codeInterpreter
  ],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto"
    },
    store: true
  }
});

const agent = new Agent({
  name: "Clarification Agent",
  instructions: `You are a helpful assistant that asks for clarification when user questions are too vague or ambiguous.

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
  return await withTrace("Ask Arden", async () => {
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

    // Step 1: Always try internal Q&A first
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

    // Step 3: If no internal info found, try external fact finding
    if (internalResponse === "NO_INTERNAL_INFO_FOUND") {
      const externalFactFindingResultTemp = await runner.run(
        externalFactFinding,
        [...conversationHistory]
      );

      if (!externalFactFindingResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      return externalFactFindingResultTemp.finalOutput;
    }

    // Step 4: Return internal response if found
    return internalResponse;
  });
};
