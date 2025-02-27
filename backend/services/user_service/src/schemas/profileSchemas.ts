export const profileSchemas = {
    getUserByID: {
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
                    email: { type: "string" },
                    username: { type: "string" },
                    displayName: { type: "string" },
                    avatarURL: { type: "string" },
                    onlineStatus: { type: "boolean" },
                    wins: { type: "number" },
                    losses: { type: "number" },
                },
            },
        },
    },
    getAllUsers: {
        response: {
            200: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        email: { type: "string" },
                        username: { type: "string" },
                        displayName: { type: "string" },
                        avatarURL: { type: "string" },
                        onlineStatus: { type: "boolean" },
                        wins: { type: "number" },
                        losses: { type: "number" },
                    },
                },
            },
        },
    },
    updateUserByID: {
        params: {
            type: "object",
            required: ["userID"],
            properties: {
                userID: { type: "string" },
            },
        },
        body: {
            type: "object",
            properties: {
                email: { type: "string" },
                password: { type: "string" },
                username: { type: "string" },
                displayName: { type: "string" },
                avatarURL: { type: "string" },
                onlineStatus: { type: "boolean" },
                wins: { type: "number" },
                losses: { type: "number" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    user: {
                        type: "object",
                        properties: {
                            email: { type: "string" },
                            username: { type: "string" },
                            displayName: { type: "string" },
                            avatarURL: { type: "string" },
                            onlineStatus: { type: "boolean" },
                            wins: { type: "number" },
                            losses: { type: "number" },
                        },
                    },
                    message: { type: "string" },
                },
            },
        },
    },
    deleteUserByID: {
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
    uploadAvatar: {
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
};