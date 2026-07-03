import { Request, Response } from "express";

export function logout(req: Request, res: Response) {
  res.clearCookie("access_token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
}
