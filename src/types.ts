export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface DifficultyCount {
  name: string;
  count: number;
}

export interface ApiResponse {
  response_code: number;
  results: Question[];
}
