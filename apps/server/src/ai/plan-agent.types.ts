export type PlanAgentLogKind =
  | 'intro'
  | 'search'
  | 'location'
  | 'result'
  | 'check'
  | 'adjust'
  | 'summary';

export interface PlanAgentLog {
  kind: PlanAgentLogKind;
  text: string;
}

export type PlanAgentLogHandler = (log: PlanAgentLog) => void;

export interface SearchNotesResult {
  query: string;
  count: number;
  titles: string[];
  notes: Array<{
    id: string;
    title: string;
    snippet: string;
    content: string;
    destination: string;
  }>;
}
