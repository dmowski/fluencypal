// Module specification metadata.

export interface ModuleSpecMeta {
  file: string;
  moduleCode: string;
  moduleName: string;
}

export const MODULE_SPECS: ModuleSpecMeta[] = [
  {
    "file": "listening-comprehension.md",
    "moduleCode": "RS",
    "moduleName": "Rozumienie ze słuchu"
  },
  {
    "file": "reading-comprehension.md",
    "moduleCode": "RT",
    "moduleName": "Rozumienie tekstów pisanych"
  },
  {
    "file": "grammar.md",
    "moduleCode": "PG",
    "moduleName": "Poprawność gramatyczna"
  },
  {
    "file": "writing.md",
    "moduleCode": "P",
    "moduleName": "Pisanie"
  },
  {
    "file": "speaking.md",
    "moduleCode": "M",
    "moduleName": "Mówienie"
  }
] as const;
