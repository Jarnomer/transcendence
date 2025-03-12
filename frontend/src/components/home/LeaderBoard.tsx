import { getUsers } from '@services/userService';
import React, { useEffect, useState } from 'react';

export const LeaderBoard: React.FC = () => {
  const [users, setUsers] = useState<{ username: string; wins: number; losses: number }[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers();
        // Sort users by win/loss ratio (handling division by zero)
        const sortedUsers = data.sort((a, b) => {
          const ratioA = a.wins / (a.wins + a.losses || 1); // Avoid division by zero
          const ratioB = b.wins / (b.wins + b.losses || 1);
          return ratioB - ratioA; // Descending order
        });

        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="p-10 text-center">
      <h2>Leaderboard</h2>
      <ul className="p-2">
        {users.map((user, index) => (
          <li key={index}>
            {index + 1}. {user.username} - Wins: {user.wins}, Losses: {user.losses}
          </li>
        ))}
      </ul>
    </div>
  );
};
