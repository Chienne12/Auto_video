
export enum AgentStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum StepType {
  EVALUATION = 'EVALUATION',
  ANALYSIS = 'ANALYSIS',
  ARCHITECTURE = 'ARCHITECTURE',
  STRATEGY = 'STRATEGY',
  SYNTHESIS = 'SYNTHESIS'
}

export type OutputLanguage = 'vi' | 'en';

export interface WorkflowStep {
  id: StepType;
  title: string;
  description: string;
  status: AgentStatus;
  output?: string;
  logs: string[];
}

export interface AgentResponse {
  markdown: string;
  raw: string;
}
