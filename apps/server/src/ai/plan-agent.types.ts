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
  freshCount: number;
  duplicate: boolean;
  /** 本次检索命中的全部攻略标题（含与上轮重复的） */
  matchedTitles: string[];
  titles: string[];
  notes: Array<{
    id: string;
    title: string;
    snippet: string;
    content: string;
    destination: string;
  }>;
}
