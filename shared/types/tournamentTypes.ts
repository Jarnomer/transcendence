export interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

export interface TournamentMatch {
  gameId: string;
  players: [PlayerData | null, PlayerData | null];
  round: number;
  isComplete: boolean;
}

export type TournamentBracket = TournamentMatch[][];

export interface TournamentBracketProps {
  players: TournamentBracket;
}

export interface TournamentPlayerListProps {
  players: PlayerData[];
}

export function createPlayerData(
  user_id: string | undefined,
  avatar_url: string | undefined,
  display_name: string | undefined
): PlayerData | null {
  if (!user_id) return null;
  
  return {
    user_id,
    avatar_url: avatar_url || '/images/avatars/default_avatar.png',
    display_name: display_name || 'Unknown Player'
  };
}

export function generateEmptyBracket(playerCount: number): TournamentBracket {
  const totalRounds = Math.ceil(Math.log2(playerCount));
  const matchesPerRound: number[] = [];

  for (let r = 0; r < totalRounds; r++) {
    matchesPerRound.push(Math.floor(playerCount / Math.pow(2, r + 1)));
  }
  
  let gameIdCounter = 1;
  const bracket: TournamentBracket = [];

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches: TournamentMatch[] = [];

    for (let m = 0; m < matchesPerRound[round]; m++) {
      roundMatches.push({
        gameId: `game-${gameIdCounter++}`,
        players: [null, null],
        round: round + 1,
        isComplete: false,
      });
    }
    bracket.push(roundMatches);
  }
  return bracket;
}
