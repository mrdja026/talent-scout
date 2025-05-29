import { EventEmitter } from "events";

/**
 * Event bus for inter-service communication in the distributed architecture
 * This simulates a message broker like Kafka, RabbitMQ, or Redis pub/sub
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners for different services
  }

  /**
   * Emit an event to all listeners
   * @param eventName The name of the event
   * @param payload The event data
   */
  emit(eventName: string, payload: any): boolean {
    console.log(`[EventBus] Emitting event: ${eventName}`);
    return super.emit(eventName, payload);
  }

  /**
   * Subscribe to an event
   * @param eventName The name of the event
   * @param listener The callback function
   */
  subscribe(eventName: string, listener: (...args: any[]) => void): this {
    console.log(`[EventBus] New subscription to: ${eventName}`);
    return this.on(eventName, listener);
  }

  /**
   * Subscribe to an event once
   * @param eventName The name of the event
   * @param listener The callback function
   */
  subscribeOnce(eventName: string, listener: (...args: any[]) => void): this {
    return this.once(eventName, listener);
  }

  /**
   * Unsubscribe from an event
   * @param eventName The name of the event
   * @param listener The callback function
   */
  unsubscribe(eventName: string, listener: (...args: any[]) => void): this {
    return this.off(eventName, listener);
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

/**
 * Set up event listeners for the different services
 */
export function setupEventBus() {
  // Workflow Events
  eventBus.subscribe("workflow:created", (data) => {
    console.log(`[Workflow Service] Workflow created: ${data.workflow.name}`);
  });

  eventBus.subscribe("workflow:updated", (data) => {
    console.log(`[Workflow Service] Workflow updated: ${data.workflow.name}`);
  });

  eventBus.subscribe("workflow:deleted", (data) => {
    console.log(`[Workflow Service] Workflow deleted: ID ${data.workflowId}`);
  });

  eventBus.subscribe("workflow:execute", (data) => {
    console.log(`[Workflow Service] Executing workflow: ${data.workflow.name}`);
    
    // In a real implementation, this would initiate the workflow execution
    // across the distributed system, coordinating the different microservices
  });

  // Model Events
  eventBus.subscribe("model:created", (data) => {
    console.log(`[Model Service] Model created: ${data.model.name}`);
  });

  eventBus.subscribe("model:updated", (data) => {
    console.log(`[Model Service] Model updated: ${data.model.name}`);
  });

  eventBus.subscribe("model:deleted", (data) => {
    console.log(`[Model Service] Model deleted: ID ${data.modelId}`);
  });

  eventBus.subscribe("model:generate:start", (data) => {
    console.log(`[Model Service] Generation started with model: ${data.model.name}`);
  });

  eventBus.subscribe("model:generate:complete", (data) => {
    console.log(`[Model Service] Generation completed with model: ${data.model.name}`);
  });

  // Agent Events
  eventBus.subscribe("agent:created", (data) => {
    console.log(`[Agent Service] Agent created: ${data.agent.name}`);
  });

  eventBus.subscribe("agent:updated", (data) => {
    console.log(`[Agent Service] Agent updated: ${data.agent.name}`);
  });

  eventBus.subscribe("agent:deleted", (data) => {
    console.log(`[Agent Service] Agent deleted: ID ${data.agentId}`);
  });

  eventBus.subscribe("agent:run:start", (data) => {
    console.log(`[Agent Service] Agent run started: ${data.agent.name}`);
  });

  eventBus.subscribe("agent:run:complete", (data) => {
    console.log(`[Agent Service] Agent run completed: ${data.agent.name}`);
  });

  console.log("[EventBus] Event bus initialized and listeners set up");
}
