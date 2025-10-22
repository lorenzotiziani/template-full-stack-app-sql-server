import {NextFunction, Request, Response} from "express";

export class NotFoundError extends Error{
    constructor() {
        super('Entity Not found');
    }
}


export const notFoundHandler = (err: Error, req: Request, res: Response, next: NextFunction) =>{
    if (err instanceof NotFoundError) {
        res.status(404).json({
            error: 'NotFoundError',
            message: err.message
        })
    }else{
        next(err)
    }
}