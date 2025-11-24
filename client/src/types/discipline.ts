export interface Discipline {
  id: string;
  name: string;
  fullName: string;
  level: string;
  description: string;
  icon: string;
  color: string;
  dataFile: string;
  briefingText: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'agc',
    name: 'AGC',
    fullName: 'Armement Gros Calibre',
    level: 'LASM 2',
    description: 'Test de révision sur l\'armement gros calibre',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    dataFile: '/quiz_data_agc.json',
    briefingText: "Bonjour et bienvenue au test d'évaluation sur l'Armement Gros Calibre. Ce quiz comprend 57 questions à choix multiples couvrant tous les aspects de l'armement gros calibre. Vous disposerez de 60 secondes pour répondre à chaque question. Bonne chance !"
  },
  {
    id: 'munitions',
    name: 'Généralités Munitions',
    fullName: 'Généralités sur les Munitions',
    level: 'LASM 3',
    description: 'Devoir de contrôle sur les généralités des munitions',
    icon: '💣',
    color: 'from-orange-500 to-red-500',
    dataFile: '/quiz_data_munitions.json',
    briefingText: "Bonjour et bienvenue au devoir de contrôle sur les Généralités des Munitions. Ce test comprend des questions à choix multiples couvrant les principes fondamentaux des munitions militaires. Vous disposerez de 60 secondes pour répondre à chaque question. Bonne chance !"
  },
  {
    id: 'explosions',
    name: 'EFFETS des Explosions',
    fullName: 'EFFETS des explosions sur les structures',
    level: 'LASM 3',
    description: 'Étude des effets des explosions sur les structures militaires',
    icon: '💥',
    color: 'from-red-500 to-pink-500',
    dataFile: '/quiz_data_explosions.json',
    briefingText: "Bonjour et bienvenue au test d'évaluation sur les Effets des Explosions sur les Structures. Ce quiz comprend des questions à choix multiples sur l'impact des explosions sur les structures militaires. Vous disposerez de 60 secondes pour répondre à chaque question. Bonne chance !"
  }
];
