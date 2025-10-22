import {NextFunction, Request, Response} from "express";

import * as z from "zod"
export const validationError = (err: Error, req: Request, res: Response, next: NextFunction) =>{
    if (err instanceof z.ZodError) {
        res.status(400).json(err.issues)
    }else{
        next(err)
    }
}