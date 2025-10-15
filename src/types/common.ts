import { APP_TYPE, AVATAR_TYPE } from "@/constants";

export type ValueOf<T> = T[keyof T];

export type AppType = ValueOf<typeof APP_TYPE>;

export type AvatarType = ValueOf<typeof AVATAR_TYPE>;
