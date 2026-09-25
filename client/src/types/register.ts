export type RegisterField = "pseudo" | "email" | "password" | "cgu";

export type RegisterFieldError = Partial<Record<RegisterField, string>>;
