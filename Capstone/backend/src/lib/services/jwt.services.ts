import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";

export interface TokenPayload extends JwtPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string,
  ) as TokenPayload;
};
