export class AITransformerParseError extends Error {
  static isAITransformerParseError(error: any): error is AITransformerParseError {
    return error && error instanceof AITransformerParseError;
  }
}
