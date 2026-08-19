// Let TypeScript understand `?raw` imports (Vite feature).
declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}
