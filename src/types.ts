export interface VocabItem {
  /** Texte en espagnol */
  es: string;
  /** Traduction française canonique */
  fr: string;
  /** Autres traductions françaises acceptées en saisie libre */
  altFr?: string[];
  /** Vrai si l'élément est une phrase (utilisé pour la banque de mots) */
  sentence?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  items: VocabItem[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

export type Exercise =
  | {
      type: "choice";
      /** Texte affiché comme consigne */
      prompt: string;
      promptLang: "es" | "fr";
      options: string[];
      correctIndex: number;
    }
  | {
      type: "wordbank";
      promptFr: string;
      targetEs: string;
      /** Jetons proposés (bonne réponse + intrus), mélangés */
      tokens: string[];
    }
  | {
      type: "type";
      promptEs: string;
      /** Réponses françaises acceptées (formes brutes, normalisées à la volée) */
      answers: string[];
    }
  | {
      type: "match";
      pairs: { es: string; fr: string }[];
    };

export interface LessonRecord {
  /** Nombre de fois que la leçon a été terminée */
  completions: number;
  /** Vrai si la leçon a déjà été réussie sans aucune faute */
  perfect: boolean;
}

export interface Progress {
  xp: number;
  hearts: number;
  /** Horodatage (ms) de la dernière régénération de cœur */
  lastHeartAt: number;
  lessons: Record<string, LessonRecord>;
}
