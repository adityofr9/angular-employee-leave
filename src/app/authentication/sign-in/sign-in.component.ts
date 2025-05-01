import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { AuthService } from 'src/app/api/auth/auth.service';
import { SessionsService } from 'src/app/core/sessions/sessions.service';

import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  isPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private helper:HelperService,
    private sessions: SessionsService,
    protected storage : StorageMap,
  ) { }

  ngOnInit() {
    this.setupForm();
  }

  setupForm(){
    this.loginForm = this.fb.group({
      // email: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Tandai semua field sebagai touched untuk memunculkan error
      return;
    }

    this.isLoading = true; // Mulai loading
    this.loginForm.value.email.toLowerCase();

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }

    this.authService.login(payload).then(
      res=> {
        if (res && res.length > 0) {
          const admin = res.find((u: any) => u.role === 'role 1');
          if (admin) {
            localStorage.setItem('currentUser', JSON.stringify(admin));
              setTimeout(() => {
                this.isLoading = false;
                this.sessions.loadSession();
                this.router.navigate(['/u/dashboard']);
              }, 1500);
            return admin;
          }
          this.helper.showErrorAlert('Error', 'Login gagal!')
          this.isLoading = false;
          return null;
        }
        this.helper.showErrorAlert('Error', 'Login gagal!')
        this.isLoading = false;
        return null;
      },
      error=>{
        this.isLoading = false; // Selesai loading
        let errorMessage = 'An error occurred. Please try again.';
        if (error.status === 401 || error.status === 400) {
          errorMessage = 'Email atau password salah';
        } else if (error.status === 0) {
          errorMessage = 'Email atau password salah';
         // errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        } else {
          errorMessage = 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.';
        }
        this.helper.showErrorAlert('Error', 'Login gagal!')
      }
    );
  }

  isFieldInvalid(field: string): boolean {
    return (this.loginForm.get(field)?.invalid ?? false) && ((this.loginForm.get(field)?.touched ?? false) || (this.loginForm.get(field)?.dirty ?? false));
  }

  togglePassword() {
    this.isPassword = !this.isPassword;
  }

}
