import { Static, TSchema, Type } from '@sinclair/typebox';

export const LoginSchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
  email: Type.Optional(Type.String()),
  refresh_token: Type.Optional(Type.String()),
});

export const RegisterSchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
  email: Type.Optional(Type.String()),
});

export const RefreshSchema = Type.Object({
  cookie: Type.String({ description: 'JWT stored in cookie' }),
});

export const ValidateSchema = Type.Object({
  authorization: Type.String({ description: 'Bearer <token>' }),
});

export const UpdateSchema = Type.Object({
  user_id: Type.String(),
  updates: Type.Object({
    username: Type.Optional(Type.String()),
    old_password: Type.Optional(Type.String()),
    new_password: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
  }),
});

export const DeleteSchema = Type.Object({
  user_id: Type.String(),
});

export const LogoutSchema = Type.Object({
  user_id: Type.String(),
});

export const ApiResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Optional(dataSchema),
    errors: Type.Optional(
      Type.Array(
        Type.Object({
          field: Type.String(),
          message: Type.String(),
        })
      )
    ),
  });

export type LoginType = Static<typeof LoginSchema>;
export type RegisterType = Static<typeof RegisterSchema>;
export type RefreshType = Static<typeof RefreshSchema>;
export type ValidateType = Static<typeof ValidateSchema>;
export type UpdateType = Static<typeof UpdateSchema>;
export type DeleteType = Static<typeof DeleteSchema>;
export type LogoutType = Static<typeof LogoutSchema>;
export type ApiResponseType<T extends TSchema> = Static<ReturnType<typeof ApiResponseSchema<T>>>;
