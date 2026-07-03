import { Request, Response } from "express";

export function verify(req: Request, res: Response) {
  return res.status(200).json({
    authenticated: true,
  });
}
