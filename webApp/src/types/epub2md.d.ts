declare module 'epub2md' {
  export interface EpubSection {
    htmlString: string;
    toMarkdown: () => string;
  }

  export interface EpubObject {
    sections: EpubSection[];
  }

  export interface ParseEpubOptions {
    type?: 'binaryString' | 'path' | 'buffer';
    expand?: boolean;
    convertToMarkdown?: (htmlstr: string) => string;
  }

  export function parseEpub(
    target: string | Buffer,
    options?: ParseEpubOptions,
  ): Promise<EpubObject>;
}
