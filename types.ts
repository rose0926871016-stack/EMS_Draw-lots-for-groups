
export interface Participant {
  id: string;
  name: string;
}

export type ViewType = 'setup' | 'lucky-draw' | 'grouping';

export interface Group {
  id: number;
  members: Participant[];
}
