export type RegisterField = "pseudo" | "email" | "password" | "address" | "cgu";

export type RegisterFieldError = Partial<Record<RegisterField, string>>;
