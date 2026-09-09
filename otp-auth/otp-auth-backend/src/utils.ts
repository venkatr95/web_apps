
import { Request, Response, NextFunction } from "express"

// Function to generate a random 6-digit OTP
function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

const asyncHandler = (fn:any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler;