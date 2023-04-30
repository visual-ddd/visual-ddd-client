export interface IRateLimit {
  allow(id: string, amount: number): Promise<boolean>;
}
