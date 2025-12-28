<video src="menu_demo.mp4" width="800" autoplay loop muted playsinline></video>

# transcendence

| Person | Task 1              | Task 2            | Task 3           |
| ------ | ------------------- | ----------------- | ---------------- |
| Janrau | Remote Players      | Backend Database  | User Management  |
| Lassi  | AI opponent         | Backend Framework | Server-Side Pong |
| Olli   | Front-end Framework | Live Chat         | ------           |
| Jarno  | 3D Graphics         | Microservices     | ------           |

#### Current score: 7.5/7 ✅

### Legend

| Icon | Description |
| ---- | ----------- |
| ✅   | Done        |
| ❌   | Undone      |
| ⌛️   | In Progress |

## 🏆 Major module [1/7] : Backend framework

| Task                                                                                                                      | Status |
| ------------------------------------------------------------------------------------------------------------------------- | ------ |
| In this major module, you are required to use a specific web framework for backend development: `Fastify` with `Node.js`. | ✅     |

## 🏆 Major Module [2/7] : User Management

| Task                                                                                                           | Status |
| -------------------------------------------------------------------------------------------------------------- | ------ |
| Users can securely subscribe to the website.                                                                   | ✅     |
| Registered users can securely log in.                                                                          | ✅     |
| Users can select a unique display name to participate in tournaments.                                          | ✅     |
| Users can update their information.                                                                            | ✅     |
| Users can upload an avatar, with a default option if none is provided.                                         | ✅     |
| Users can add others as friends and view their online status.                                                  | ✅     |
| User profiles display stats, such as wins and losses.                                                          | ✅     |
| Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users. | ✅     |

## 🏆 Major Module [3/7] : Server-Side Pong

| Task                                                                                                                                                                                        | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Develop server-side logic for the Pong game to handle gameplay, ball movement, scoring, and player interactions.                                                                            | ✅     |
| Create an API that exposes the necessary resources and endpoints to interact with the Pong game, allowing partial usage of the game via the Command-Line Interface (CLI) and web interface. | ✅     |
| Design and implement the API endpoints to support game initialization, player controls, and game state updates.                                                                             | ✅     |
| Ensure that the server-side Pong game is responsive, providing an engaging and enjoyable gaming experience.                                                                                 | ✅     |
| Integrate the server-side Pong game with the web application, allowing users to play the game directly on the website.                                                                      | ✅     |

## 🏆 Major Module [4/7] : Remote players

| Task                                                                                                                                                               | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| It should be possible for two players to play remotely. Each player is located on a separated computer, accessing the same website and playing the same Pong game. | ✅     |
| Consider network issues, such as unexpected disconnections or lag. You must offer the best user experience possible.                                               | ⚠️     |

## 🏆 Major Module [5/7] : AI opponent

| Task                                                                                                                                                                                                                                                                  | Status |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Develop an AI opponent that provides a challenging and engaging gameplay experience for users.                                                                                                                                                                        | ✅     |
| The AI must replicate human behavior, which means that in your AI imple- mentation, you must simulate keyboard input. The constraint here is that the AI can only refresh its view of the game once per second, requiring it to anticipate bounces and other actions. | ✅     |
| Implement AI logic and decision-making processes that enable the AI player to make intelligent and strategic moves.                                                                                                                                                   | ✅     |
| Explore alternative algorithms and techniques to create an effective AI player without relying on A\*.                                                                                                                                                                | ✅     |
| Ensure that the AI adapts to different gameplay scenarios and user interactions.                                                                                                                                                                                      | ✅     |
| The AI must utilize power-ups if you have chosen to implement the Game customization options module.                                                                                                                                                                  | ⚠️     |

## 🏆 Major Module [6/7] : Live Chat

| Task                                                                                                                     | Status |
| ------------------------------------------------------------------------------------------------------------------------ | ------ |
| The user should be able to send direct messages to other users.                                                          | ✅     |
| The user should be able to block other users, preventing them from seeing any further messages from the blocked account. | ✅     |
| The user should be able to invite other users to play a Pong game through the chat interface.                            | ✅     |
| The tournament system should be able to notify users about the next game.                                                | ✅     |
| The user should be able to access other players’ profiles through the chat interface.                                    | ✅     |

## 🏆 Major Module [7/7] : Advanced 3D Graphics

| Task                                                                                                                                                                                                                                                                          | Status |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Advanced 3D Graphics: The primary goal of this module is to implement advanced 3D graphics techniques to elevate the visual quality of the Pong game. By utilizing Babylon.js , the goal is to create stunning visual effects that immerse players in the gaming environment. | ✅     |
| Immersive Gameplay: The incorporation of advanced 3D techniques enhances the overall gameplay experience by providing users with a visually engaging and captivating Pong game.                                                                                               | ✅     |
| Technology Integration: The chosen technology for this module is Babylon.js. These tools will be used to create the 3D graphics, ensuring compatibility and optimal performance.                                                                                              | ✅     |

## 🏅 Minor Module [7.5/7] : Game customization options

| Task                                                                                                               | Status |
| ------------------------------------------------------------------------------------------------------------------ | ------ |
| Offer customization features, such as power-ups, attacks, or different maps, that enhance the gameplay experience. | ✅     |
| Allow users to choose a default version of the game with basic features if they prefer a simpler experience.       | ✅     |
| Ensure that customization options are available and applicable to all games offered on the platform.               | ✅     |
| Implement user-friendly settings menus or interfaces for adjusting game parameters.                                | ✅     |
| Maintain consistency in customization features across all games to provide a unified user experience.              | ✅     |

## 🏅 Minor Module [8/7] : Front-end framework

| Task                                                                                                     | Status |
| -------------------------------------------------------------------------------------------------------- | ------ |
| Your frontend development must use the `Tailwind CSS` in addition of the `Typescript`, and nothing else. | ✅     |

## 🏅 Minor Module [8.5/7] : Backend database

| Task                                                                                                                                                                                                                                            | Status |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| The designated database for all DB instances in your project is `SQLite` This choice ensure data consistency and compatibility across all project components and may be a prerequisite for other modules, such as the backend Framework module. | ✅     |

## 🏅 Minor Module [9/7] : Browser Compatibility

| Task                                                                                                                                                    | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Extend browser support to include an additional web browser, ensuring that users can access and use the application seamlessly.                         | ✅     |
| Conduct thorough testing and optimization to ensure that the web application functions correctly and displays correctly in the newly supported browser. | ✅     |
| Address any compatibility issues or rendering discrepancies that may arise in the added web browser.                                                    | ✅     |
| Ensure a consistent user experience across all supported browsers, maintaining usability and functionality.                                             | ✅     |

## 🏅 Minor Module [9.5/7] : Device Support

| Task                                                                                                                                                                                  | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Ensure the website is responsive, adapting to different screen sizes and orientations, providing a consistent user experience on desktops, laptops, tablets, and smartphones.         | ✅     |
| Ensure that users can easily navigate and interact with the website using different input methods, such as touchscreens, keyboards, and mice, depending on the device they are using. | ✅     |

## 🏅 Minor Module [10/7] : User and Game Stats Dashboards

| Task                                                                                                                                | Status |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Create user-friendly dashboards that provide users with insights into their gaming statistics.                                      | ❌     |
| Develop a separate dashboard for game sessions, showing detailed statistics, outcomes, and historical data for each match.          | ❌     |
| Ensure that the dashboards offer an intuitive and informative user interface for tracking and analyzing data.                       | ❌     |
| Implement data visualization techniques, such as charts and graphs, to present statistics in a clear and visually appealing manner. | ❌     |
| Allow users to access and explore their own gaming history and performance metrics conveniently.                                    | ❌     |
| Feel free to add any metrics you deem useful.                                                                                       | ⚠️     |

## 🏅 Minor Module [10.5/7] : Multiple language support

| Task                                                                                                                                             | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Implement support for a minimum of three languages on the website to accommodate a broad audience.                                               | ❌     |
| Provide a language switcher or selector that allows users to easily change the website’s language based on their preferences.                    | ❌     |
| Translate essential website content, such as navigation menus, headings, and key information, into the supported languages.                      | ❌     |
| Ensure that users can navigate and interact with the website seamlessly, regardless of the selected language.                                    | ❌     |
| Consider using language packs or localization libraries to simplify the translation process and maintain consistency across different languages. | ❌     |
| Allow users to set their preferred language as the default for subsequent visits.                                                                | ❌     |
