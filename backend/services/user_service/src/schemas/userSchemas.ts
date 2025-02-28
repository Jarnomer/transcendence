export const userSchemas = {
  registerUser: {
    body: {
      type: "object",
      required: ["password", "username"],
      properties: {
        password: { type: "string" },
        username: { type: "string" },
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

  loginUser: {
    body: {
      type: "object",
      required: ["password", "username"],
      properties: {
        password: { type: "string" },
        username: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
      },
    },
  },

  logoutUser: {
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
