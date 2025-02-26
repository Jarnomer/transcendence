export const matchmakingSchemas = {
    getStatusByID: {
        params: {
            type: "object",
            required: ["userID"],
            properties: {
                userID: { type: "string" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    user: {
                        type: "object",
                        properties: {
                            userID: { type: "string" },
                            status: { type: "string" },
                            gameID: { type: "string" },
                        },
                    },
                    message: { type: "string" },
                },
            },
        },
    },
    join: {
        body: {
            type: "object",
            required: ["userID"],
            properties: {
                userID: { type: "string" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    status: { type: "string" },
                    message: { type: "string" },
                    gameID: { type: "string" },
                },
            },
        },
    },
    cancelByID: {
        params: {
            type: "object",
            required: ["userID"],
            properties: {
                userID: { type: "string" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    message: { type: "string" },
                },
            },
        },
    },
    result: {
        body: {
            type: "object",
            required: ["gameID", "winnerID", "player1Score", "player2Score"],
            properties: {
                gameID: { type: "string" },
                winnerID: { type: "string" },
                player1Score: { type: "number" },
                player2Score: { type: "number" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    message: { type: "string" },
                },
            },
        },
    },
};