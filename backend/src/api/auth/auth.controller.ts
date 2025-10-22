import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginDTO,registerDTO, registerRequirements,loginRequirements } from './auth.dto';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validationResult = registerRequirements.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Dati di registrazione non validi',
          details: validationResult.error.issues
        });
      }

      const data: registerDTO = req.body;
      const result = await AuthService.register(data);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la registrazione'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validationResult = loginRequirements.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Dati di login non validi',
          details: validationResult.error.issues
        });
      }

      const data: loginDTO = req.body;
      const result = await AuthService.login(data);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il login'
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token richiesto'
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il refresh del token'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      
      res.json({
        success: true,
        message: 'Logout effettuato con successo'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Errore durante il logout'
      });
    }
  }
}