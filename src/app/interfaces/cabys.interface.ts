export interface ICabysSuggestionResponse {
  count: number;
  isValid: boolean;
  suggestions: ICabysSuggestion[];
}

export interface ICabysSuggestion {
  code: string | null;
  description: string | null;
  tax: number | null;
}
