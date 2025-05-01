import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  isLoadingAdfs: boolean = false;

  // MARK: Bypass
  // tempUser: any = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    // private messageService: MessageService,
    private helper:HelperService,
    private sessions: SessionsService
  ) { }

  ngOnInit() {
    this.setupForm();
  }

  setupForm(){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],                       // use with dummyJSON
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

    // Temp dummyJSON payload
    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }

    this.authService.login(payload).then(
      res=> {
        if(res?.token){
          this.helper.setStorage('token-x', res.token);
          this.authService.token = res.token;
          this.authService.GET_UserData();
          setTimeout(() => {
            this.isLoading = false;
            this.sessions.loadSession();
            this.router.navigate(['/u/dashboard']);
          }, 1500);
        }
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
        this.showError(errorMessage);
      }
    );
  }

  loginCMS(payload: any) {
    this.authService.login(payload).then(res=>{
      if(res?.data?.accessToken){
        this.helper.setStorage('token-x', res.data.accessToken);
        this.authService.token = res.data.accessToken;
        this.authService.GET_UserData();
        setTimeout(() => {
          this.isLoading = false;
          this.sessions.loadSession();
          this.router.navigate(['/u/dashboard']);
        }, 1500);
      }
    }).catch(error=>{
      this.isLoading = false; // Selesai loading
      this.isLoadingAdfs = false;
        let errorMessage = 'An error occurred. Please try again.';
        if (error.status === 401 || error.status === 400) {
          errorMessage = 'Email atau password salah';
        } else if (error.status === 0) {
          errorMessage = 'Email atau password salah';
        } else {
          errorMessage = 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.';
        }
        this.showError(errorMessage);
    });
  }

  showError(message: string) {
    // this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: message });
  }

  isFieldInvalid(field: string): boolean {
    return (this.loginForm.get(field)?.invalid ?? false) && ((this.loginForm.get(field)?.touched ?? false) || (this.loginForm.get(field)?.dirty ?? false));
  }

  togglePassword() {
    this.isPassword = !this.isPassword;
  }

}
