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
  instructions: "Answer the user's question using the knowledge tools you have on hand (file or web search). Be concise and answer succinctly, using bullet points and summarizing the answer up front",
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

Make sure to output a concise answer followed by summarized bullet point of supporting evidence`,
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
  name: "Agent",
  instructions: "Ask the user to provide more detail so you can help them by either answering their question or running data analysis relevant to their query",
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
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput): Promise<string> => {
  return await withTrace("Ask Arden", async () => {
    // Build conversation history from previous messages
    const conversationHistory: AgentInputItem[] = [];
    
    if (workflow.conversationHistory && workflow.conversationHistory.length > 0) {
      // Add previous conversation context (limit to last 10 messages to avoid token limits)
      const recentHistory = workflow.conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        conversationHistory.push({
          role: msg.role,
          content: [{ type: "input_text", text: msg.content }]
        });
      }
    }
    
    // Add current user message
    conversationHistory.push(
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    );
    
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_691aec679d148190acb697f21c1b97cf0f5d21d664dc03c5"
      }
    });

    const classifyResultTemp = await runner.run(
      classify,
      [
        ...conversationHistory,
        {
          role: "user",
          content: [
            { type: "input_text", text: `Question: ${workflow.input_as_text}` }
          ]
        }
      ]
    );
    
    conversationHistory.push(...classifyResultTemp.newItems.map((item) => item.rawItem));

    if (!classifyResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const classifyResult = {
      output_parsed: classifyResultTemp.finalOutput
    };

    let finalResponse = "";

    if (classifyResult.output_parsed.operating_procedure === "q-and-a") {
      const internalQAResultTemp = await runner.run(
        internalQA,
        [...conversationHistory]
      );
      conversationHistory.push(...internalQAResultTemp.newItems.map((item) => item.rawItem));

      if (!internalQAResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      finalResponse = internalQAResultTemp.finalOutput;
    } else if (classifyResult.output_parsed.operating_procedure === "fact-finding") {
      const externalFactFindingResultTemp = await runner.run(
        externalFactFinding,
        [...conversationHistory]
      );
      conversationHistory.push(...externalFactFindingResultTemp.newItems.map((item) => item.rawItem));

      if (!externalFactFindingResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      finalResponse = externalFactFindingResultTemp.finalOutput;
    } else {
      const agentResultTemp = await runner.run(
        agent,
        [...conversationHistory]
      );
      conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

      if (!agentResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      finalResponse = agentResultTemp.finalOutput;
    }

    return finalResponse;
  });
};
