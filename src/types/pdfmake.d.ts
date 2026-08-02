declare module "pdfmake/build/pdfmake" {
  const pdfmake: {
    vfs: Record<string, string>;
    fonts: Record<string, unknown>;
    createPdf(docDefinition: unknown): { getBuffer(cb: (buffer: Buffer) => void): void };
  };
  export = pdfmake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: { vfs: Record<string, string> };
  export = vfs;
}