import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  registerError: string = '';

  constructor(
    private fb: FormBuilder,
    private registerService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirm: ['', Validators.required],
      nome: ['', Validators.required],
      cognome: ['', Validators.required]
    });

  }

  register() {
    if (this.registerForm.invalid) return;

    const newUser: AuthService = this.registerForm.value;

    this.registerService.add(newUser).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.registerError = res.error || 'Errore sconosciuto';
          return;
        }
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        // Handles HTTP errors (like 409 or 500)
        this.registerError = err.error?.error || 'Errore di connessione';
      }
    });

  }
}
