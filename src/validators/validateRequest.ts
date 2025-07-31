import { Request, Response, NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req);
  if (!error.isEmpty())
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.array().map((err) => err.msg),
    });
  const data = matchedData(req);
  req.data = data;
  next();
};
