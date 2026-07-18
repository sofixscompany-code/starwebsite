import { createMiddleware } from "@tanstack/react-start";
import { firebaseAuth } from "./auth";

export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await firebaseAuth.getSession();
    return next({
      context: {
        firebaseUser: data?.user ?? null,
      },
    });
  },
);
