export const APP_MODE =
  process.env.NEXT_PUBLIC_APP_MODE === "static" ? "static" : "full";

export const IS_STATIC_MODE = APP_MODE === "static";
