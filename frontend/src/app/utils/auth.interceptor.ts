import { inject } from "@angular/core";
import { JwtService } from "../services/jwt.service";
import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const jwtService = inject(JwtService);
    const authTokens = jwtService.getToken();

    if (req.url.includes('/api/login') || req.url.includes('/api/refresh')) {
        return next(req);
    }


    if (!authTokens || !jwtService.areTokensValid()) {
        return next(req);
    }

    const newReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authTokens.token}`),
    });
    return next(newReq);
}