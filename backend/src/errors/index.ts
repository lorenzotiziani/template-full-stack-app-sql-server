import { genericHandler } from "./generic.error";
import { notFoundHandler } from "./notFound.error";
import { validationError } from "./validation.error";

export const handlers = [
    notFoundHandler,
    validationError,
    genericHandler
];
