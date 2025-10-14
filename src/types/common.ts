import { APP_TYPE, AVATAR_TYPE } from "@/constants";

export type AppType = (typeof APP_TYPE)[keyof typeof APP_TYPE];

export type AvatarType = (typeof AVATAR_TYPE)[keyof typeof AVATAR_TYPE];
