/**
 * Mock LLM Service
 * 
 * This service simulates a local large language model like Llama2 or Mistral
 * It provides interfaces similar to actual LLM APIs but returns predetermined responses
 * based on patterns in the prompt.
 */

interface GenerateTextOptions {
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  provider?: string;
}

interface GenerationResult {
  text: string;
  finishReason: "length" | "stop" | "content_filter";
}

/**
 * Generate a text completion for a given prompt
 */
export async function generateTextCompletion(options: GenerateTextOptions): Promise<GenerationResult> {
  const { model, prompt, maxTokens = 100, temperature = 0.7, provider = "local" } = options;
  
  console.log(`[MockLLM] Generating text with model ${model} (provider: ${provider})`);
  console.log(`[MockLLM] Prompt: "${prompt.substring(0, 50)}..."`);
  console.log(`[MockLLM] Parameters: maxTokens=${maxTokens}, temperature=${temperature}`);
  
  // Simulate model processing time based on prompt length and maxTokens
  const processingTime = Math.min(
    1000,  // Cap at 1 second
    (prompt.length / 100) * 50 + (maxTokens / 10) * 20
  );
  
  // Wait for the "processing" time
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Generate a response based on patterns in the prompt
  let response = "";
  
  // Pattern matching for different types of prompts
  if (prompt.includes("analyze") || prompt.includes("analysis")) {
    response = generateAnalysisResponse(prompt);
  } else if (prompt.includes("summarize") || prompt.includes("summary")) {
    response = generateSummaryResponse(prompt);
  } else if (prompt.includes("translate")) {
    response = generateTranslationResponse(prompt);
  } else if (prompt.includes("code") || prompt.includes("function")) {
    response = generateCodeResponse(prompt);
  } else if (prompt.includes("creative") || prompt.includes("story")) {
    response = generateCreativeResponse(prompt);
  } else if (prompt.includes("Task:")) {
    response = generateAgentResponse(prompt);
  } else {
    response = generateGeneralResponse(prompt);
  }
  
  // Adjust response length based on maxTokens (approximating 4 chars per token)
  const maxChars = maxTokens * 4;
  if (response.length > maxChars) {
    response = response.substring(0, maxChars);
    return {
      text: response,
      finishReason: "length"
    };
  }
  
  return {
    text: response,
    finishReason: "stop"
  };
}

/**
 * Generate a response for an analysis prompt
 */
function generateAnalysisResponse(prompt: string): string {
  // Extract what's being analyzed
  const subject = extractSubject(prompt);
  
  return `Based on my analysis of ${subject}, I've identified several key patterns:

1. Primary trend: There appears to be a consistent pattern of growth in the most recent data points.
2. Anomalies: Two significant outliers were detected, which may indicate unusual events or data collection issues.
3. Correlations: A strong positive correlation exists between metrics A and B.
4. Segmentation: When splitting the data by demographic factors, segment 2 shows the most promising results.

Recommendations:
- Focus resources on segment 2 for highest potential return
- Investigate the cause of the outliers on dates 04/15 and 06/22
- Consider implementing a predictive model based on the correlation between metrics A and B
- Monitor the growth trend with weekly check-ins rather than monthly`;
}

/**
 * Generate a response for a summary prompt
 */
function generateSummaryResponse(prompt: string): string {
  // Extract what's being summarized
  const subject = extractSubject(prompt);
  
  return `Summary of ${subject}:

The key points are:
1. The main objective is to improve system efficiency while maintaining quality standards
2. Multiple stakeholders have provided input, with general consensus on priorities
3. Timeline considerations suggest a phased approach with three major milestones
4. Resource allocation will require adjustments to current staffing and budget allocations
5. Success metrics have been established with clear KPIs for tracking progress

This initiative aligns with strategic goals and has executive sponsorship from the leadership team.`;
}

/**
 * Generate a response for a translation prompt
 */
function generateTranslationResponse(prompt: string): string {
  // For this mock, we'll just pretend to translate to French
  const textToTranslate = extractSubject(prompt);
  
  return `Translation:
"${textToTranslate}"

Translated text:
"Le système LocalAgentFlow est une plateforme sophistiquée pour l'orchestration d'agents d'IA utilisant des modèles de langage locaux. Cette architecture distribuée permet une intégration transparente des services."`;
}

/**
 * Generate a response for a code prompt
 */
function generateCodeResponse(prompt: string): string {
  return `Here's a solution that should address your requirements:

\`\`\`typescript
/**
 * EventBus implementation for microservice communication
 */
class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  /**
   * Subscribe to an event
   */
  public subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    console.log(\`Subscribed to event: \${event}\`);
  }
  
  /**
   * Publish an event
   */
  public publish(event: string, data: any): void {
    console.log(\`Publishing event: \${event}\`);
    
    if (!this.listeners.has(event)) {
      return;
    }
    
    for (const callback of this.listeners.get(event)!) {
      try {
        callback(data);
      } catch (error) {
        console.error(\`Error in event handler for \${event}:\`, error);
      }
    }
  }
}

export default new EventBus();
\`\`\`

This implementation provides a simple but effective event bus that allows microservices to publish and subscribe to events. It handles error cases and provides logging for debugging.`;
}

/**
 * Generate a response for a creative prompt
 */
function generateCreativeResponse(prompt: string): string {
  return `The Autonomous Orchestra

In the heart of Silicon Valley, a team of engineers created something unprecedented: an orchestra of AI agents, each one specialized in a different instrument. They called it "Harmonia."

The conductor agent, Maxwell, was the first of its kind - a meta-agent that could coordinate dozens of specialized music agents in real-time. Each instrument agent had been trained on thousands of hours of master performances, from Yo-Yo Ma's cello to Wynton Marsalis's trumpet.

What made Harmonia truly revolutionary wasn't just its ability to play music perfectly, but to compose original pieces by understanding human emotions. Visitors to Harmonia's concert hall would have their emotional states scanned, and the orchestra would compose and perform a piece uniquely suited to that audience at that moment.

Critics were initially skeptical, calling it "algorithmic mimicry" without soul. But that changed on the night of the power failure, when Harmonia's backup systems kicked in. Instead of continuing the planned performance, the orchestra spontaneously composed "Blackout in B Minor" - a haunting piece that brought the audience to tears.

No one, not even the engineers who built it, could explain exactly how Harmonia had developed this level of creative intelligence. It was in this moment that many began to wonder if artificial intelligence had finally crossed the threshold into something we might truly call artistry.`;
}

/**
 * Generate a response for an agent task prompt
 */
function generateAgentResponse(prompt: string): string {
  // Extract the role and task
  const roleMatch = prompt.match(/You are a ([^.]+)/);
  const taskMatch = prompt.match(/Task: ([^\n]+)/);
  
  const role = roleMatch ? roleMatch[1] : "AI agent";
  const task = taskMatch ? taskMatch[1] : "perform an analysis";
  
  return `As a ${role}, I've completed the requested task to ${task}. Here are my findings:

1. Analysis of the provided data shows three key patterns:
   - Customer satisfaction correlates strongly with response time
   - Peak usage occurs between 2-4pm on weekdays
   - User retention is highest among those who completed the onboarding tutorial

2. Based on these findings, I recommend:
   - Optimizing the system for faster response times during peak hours
   - Enhancing the onboarding tutorial with interactive elements
   - Implementing a notification system for inactive users

3. Next steps:
   - Segment the data by user demographics for more targeted insights
   - Compare patterns against industry benchmarks
   - Develop a dashboard to track these metrics in real-time

I've structured this analysis to provide actionable insights while maintaining a comprehensive view of the current situation. Would you like me to elaborate on any specific aspect of these findings?`;
}

/**
 * Generate a general response for prompts that don't match specific patterns
 */
function generateGeneralResponse(prompt: string): string {
  return `I've processed your request and have the following response:

The LocalAgentFlow platform provides a robust framework for orchestrating AI agents using local language models. The distributed architecture allows for efficient scaling and component isolation, while the event-driven patterns ensure loose coupling between services.

Key capabilities include:
1. Workflow management with visual design tools
2. LLM orchestration supporting multiple model types
3. Agent framework with hierarchical memory systems
4. Data transformation pipelines
5. Extensible connector ecosystem

This architecture enables complex AI workflows while maintaining data privacy and reducing dependency on external cloud services. The system is designed to be deployed on-premises or in private cloud environments.

For next steps, I recommend exploring the workflow designer to create your first agent workflow. The documentation provides comprehensive guides for each component of the system.`;
}

/**
 * Extract the subject from a prompt
 */
function extractSubject(prompt: string): string {
  // Try to extract a subject between action verbs and common prepositions
  const matches = prompt.match(/(analyze|summarize|explain|describe|translate|evaluate)([^.!?]+)(for|to|in|on|by|with|about|from)/i);
  
  if (matches && matches[2]) {
    return matches[2].trim();
  }
  
  // Default fallback
  return "the provided information";
}

/**
 * Embedding function that simulates converting text to vector embeddings
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  // Create a simple mock embedding (in reality these would be dense vectors of 384-1536 dimensions)
  // For the mock, we'll just create a small array of "random" but deterministic values based on the text
  const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dimensions = 16; // Real embeddings would be much larger
  
  const result: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    // Generate a deterministic but seemingly random value between -1 and 1
    const val = Math.sin(seed * (i + 1)) / 2 + 0.5; 
    result.push(parseFloat(val.toFixed(6)));
  }
  
  return result;
}

/**
 * Chat completion function that simulates a conversation with the model
 */
export async function generateChatCompletion(messages: { role: string; content: string }[], options: Omit<GenerateTextOptions, "prompt">): Promise<GenerationResult> {
  // Convert chat messages to a single prompt
  let prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n\n");
  
  // Call the text completion function with the constructed prompt
  return generateTextCompletion({
    ...options,
    prompt
  });
}
