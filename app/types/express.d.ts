import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { sub: number; role: string; iat?: number; exp?: number };
  }
}
