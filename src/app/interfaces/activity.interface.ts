export interface IActivitiesSuggestionResponse {
  count: number;
  isValid: boolean;
  suggestions: IActivitySuggestion[];
}

export interface IActivitySuggestion {
  code: string | null;
  name: string | null;
  description: string | null;
}

export interface ISelectedActivity {
  code: string;
  name: string;
}
