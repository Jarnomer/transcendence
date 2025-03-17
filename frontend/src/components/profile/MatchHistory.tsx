type user = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  games: any[];
};

interface MatchHistoryProps {
  user: user[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ user }) => {
  console.log(user);
  return (
    <div className="flex min-h-full flex-col gap-2 mt-2">
      {user.games && user.games.length > 0 ? (
        user.games
          .filter((game: any) => game.display_name)
          .map((game: any) => (
            <div key={game.game_id} className="flex items-center gap-3">
              <span
                className={game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'}
              >
                {game.winner.user_id === user.user_id ? 'Victory' : 'Defeat'}
              </span>
              <span
                className={game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'}
              >
                {game.display_name}
              </span>
              <span
                className={game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'}
              >
                {game.winner.user_id === user.user_id
                  ? `${game.winner.score} - ${game.loser.score}`
                  : `${game.loser.score} - ${game.winner.score}`}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(game.started_at.replace(' ', 'T')).toLocaleDateString()}
              </span>
            </div>
          ))
      ) : (
        <p>No games found.</p>
      )}
    </div>
  );
};
