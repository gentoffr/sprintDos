import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { PaisService, Pais } from '../services/pais.service';
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
  paises: Pais[] = [];

  showDropdown = false;
  passwordsMatchValidator = (form: FormGroup) => {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  };
  constructor(
    private toast: ToastService,
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private auth: AuthService,
    private paisService: PaisService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      pais: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
    this.paises = this.paisService.getPaises();
  }

  getPaisSeleccionado(): Pais | undefined {
    const codigo = this.registerForm.get('pais')?.value;
    return this.paises.find(p => p.codigo === codigo);
  }

  getBanderaSeleccionada(): string {
    const pais = this.getPaisSeleccionado();
    return pais ? `https://flagcdn.com/24x18/${pais.codigo}.png` : '';
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password, pais } = this.registerForm.value;
      var res = await this.auth.register(email, password, pais);
      // Aquí podrías guardar el país en tu base de datos si lo necesitas
      await this.auth.login(email, password).then(({ error }) => {
        if (error) {
          this.toast.show('Error al registrar: ' + error, "error");
          return;
        }
        this.auth.redirectToHome();
      });
    } else {
      this.registerError = 'Por favor completa todos los campos correctamente.';
    }
  }
}