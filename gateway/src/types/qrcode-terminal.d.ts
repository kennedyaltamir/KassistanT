declare module 'qrcode-terminal' {
  export interface GenerateOptions {
    small?: boolean;
  }

  const qrcode: {
    generate(text: string, options?: GenerateOptions): void;
  };

  export default qrcode;
}
