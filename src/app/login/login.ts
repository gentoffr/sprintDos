import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';


@Component({
    selector: 'app-home',
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
    imports: [ReactiveFormsModule, CommonModule],
})
export class Login implements OnInit {
    loginForm!: FormGroup;
    constructor(private fb: FormBuilder, public bd: SupabaseService, private authService: AuthService, private tostada: ToastService) {}
    
    ngOnInit() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
        localStorage.setItem('usuario', JSON.stringify('francisco@gmail.com'));
        localStorage.setItem('clave', JSON.stringify('123456'));
    }
    
    async onSubmit(form: any) {
        const { email, password } = form.value;
        if (form.valid) {
            await this.authService.login(email, password).then(({ error }) => {
                if (error) {
                    alert('Error en el login: ' + error.message);
                    console.log(email, password)
                    return;
                }
                this.authService.redirectToHome();
            });
        }

    }
    boton1() {
        this.loginForm.patchValue({
            email: 'franargento@gmail.com',
            password: 'capomaster',
        });
        this.tostada.show('Usuario y contraseña prellenados', 'info');
    }
    boton2() {
        this.loginForm.patchValue({
            email: 'elcu@loroto.com',
            password: 'dosardillas',
        });
        this.tostada.show('Usuario y contraseña prellenados', 'info');
    }
    boton3() {
        this.loginForm.patchValue({
            email: 'capo@master.com',
            password: 'Franco',
        });
        this.tostada.show('Usuario y contraseña prellenados', 'info');
    }
}
