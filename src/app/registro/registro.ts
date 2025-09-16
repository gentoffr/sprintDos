import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  registerForm: FormGroup;
  registerError = '';

  constructor(private fb: FormBuilder, private supabaseService: SupabaseService, private auth: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      var res = await this.supabaseService.supabase.auth.signUp({ email, password });
      await this.auth.login(email, password).then(({ error }) => {
        if (error) {
          this.registerError = 'Error en el login automático: ' + error.message;
          return;
        }
        this.auth.redirectToHome();
      });
    } else {
      this.registerError = 'Por favor completa todos los campos correctamente.';
    }
  }
}