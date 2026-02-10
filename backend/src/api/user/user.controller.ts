import { Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../middleware/auth.middleware';


export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utente non autenticato'
        });
      }

      const user = await UserService.getUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il recupero del profilo'
      });
    }
  }

  static async changePassword(req: AuthRequest, res: Response) {
    const ipAddress =
        req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'Unknown';
    try {
      const { currentPassword, newPassword } = req.body;

      await UserService.changePassword(req.user!.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password cambiata con successo'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il cambio password'
      });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utente non autenticato'
        });
      }

      await UserService.deleteUser(req.user.userId);

      res.json({
        success: true,
        message: 'Account eliminato con successo'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante l\'eliminazione dell\'account'
      });
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il recupero degli utenti'
      });
    }
  }

}