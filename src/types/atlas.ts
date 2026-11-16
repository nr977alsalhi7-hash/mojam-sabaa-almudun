export type PlaceCategory =
  | 'القرى'
  | 'الأودية'
  | 'المناطق التاريخية'
  | 'الأفلاج'
  | 'المناطق السكنية';

export type SemanticLinkType =
  | 'direct_match'
  | 'possible_link'
  | 'no_link'
  | 'proper_noun';

export type TerrainImageKey = 'fort' | 'wadi' | 'falaj' | 'coast' | 'plains';

export interface PoeticEvidence {
  attribution?: string;
  text: string;
  isHadith?: boolean;
}

export interface PlaceEntry {
  id: string;
  name: string;
  letter: string;
  category: PlaceCategory;
  typeLabel: string;
  sourcePage: string;
  imageKey: TerrainImageKey;
  coordinates: [number, number] | null;
  coordinateNote: string;
  // Section 1: التعريف بالمكان
  definition: string;
  // Section 2: السياق التاريخي والجغرافي
  historicalContext: string;
  // Section 3: السياق المعجمي (optional if omitted in source)
  lexicalContext: string | null;
  // Section 4: الجذر اللغوي
  linguisticRoot: string | null;
  // Section 5: الربط بين المعنى الفصيح والمعنى المحلي
  fushaColloquialLink: string;
  // Section 6: الشواهد الشعرية والأمثلة
  poetryAndExamples: PoeticEvidence | null;
  // Epistemological distinction
  semanticLinkType: SemanticLinkType;
  hasLocalNarrative: boolean;
  localNarrativeSummary?: string;
  // Explicit note for incomplete source text (never fabricated)
  incompleteSourceNote?: string;
  // User/researcher custom editorial notes or additions
  researcherAddition?: string;
}
