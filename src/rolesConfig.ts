export type Camp = 'villagers' | 'wolves' | 'solo';

export interface Role {
  id: string;
  name: string;
  camp: Camp;
  description: string;
  aura: 'good' | 'evil' | 'unknown'; // For Seer
  wakeUpOrder: number; // For night phase resolution
  nightAction?: boolean;
}

export const rolesCatalog: Record<string, Role> = {
  villager: {
    id: 'villager',
    name: 'Simple Villageois',
    camp: 'villagers',
    description: 'Vous n\'avez aucun pouvoir particulier. Votre seul but est de démasquer les Loups-Garous.',
    aura: 'good',
    wakeUpOrder: 0,
  },
  werewolf: {
    id: 'werewolf',
    name: 'Loup-Garou',
    camp: 'wolves',
    description: 'Chaque nuit, vous vous réunissez avec les autres Loups-Garous pour éliminer un joueur.',
    aura: 'evil',
    wakeUpOrder: 10,
    nightAction: true,
  },
  seer: {
    id: 'seer',
    name: 'Voyante',
    camp: 'villagers',
    description: 'Chaque nuit, vous pouvez découvrir l\'identité d\'un joueur.',
    aura: 'good',
    wakeUpOrder: 20,
    nightAction: true,
  },
  witch: {
    id: 'witch',
    name: 'Sorcière',
    camp: 'villagers',
    description: 'Vous possédez deux potions : une pour sauver la victime des loups, et une pour éliminer un joueur.',
    aura: 'good',
    wakeUpOrder: 30,
    nightAction: true,
  },
  zoubir: {
    id: 'zoubir',
    name: 'Zoubir',
    camp: 'solo', // Neutre/Hybride
    description: 'Nuit 1 : Copiez le rôle d\'un joueur. Toutes les 2 nuits : Devinez la carte d\'un joueur parmi 3.',
    aura: 'unknown',
    wakeUpOrder: 15,
    nightAction: true,
  }
};

// Logique spécifique pour les nuits du Zoubir
export const zoubirLogic = {
  // Nuit 1 : Choix de la cible à copier
  canCopy: (nightNumber: number) => nightNumber === 1,
  
  // Nuit 3, 5, 7... : Mini-jeu de déduction
  canPlayMinigame: (nightNumber: number) => nightNumber > 1 && nightNumber % 2 !== 0,
  
  // Génère les 3 cartes pour le mini-jeu (la vraie cible + 2 rôles aléatoires non attribués)
  generateMinigameCards: (targetRole: string, unassignedRoles: string[]): string[] => {
    // Sélectionne 2 rôles au hasard dans les non attribués
    const shuffledUnassigned = [...unassignedRoles].sort(() => 0.5 - Math.random());
    const decoys = shuffledUnassigned.slice(0, 2);
    
    // Ajoute le vrai rôle et mélange les 3
    const finalCards = [targetRole, ...decoys].sort(() => 0.5 - Math.random());
    return finalCards;
  }
};
