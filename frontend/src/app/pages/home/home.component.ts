import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private authService: AuthService ) { }

  logout() {
    this.authService.logout().subscribe({
      complete: () => console.log('Logout completato')
    });
  }
}
