import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private timeoutId: any;
  private idleTime = 15 * 60 * 1000; // 15 menit
  public onIdleEvent: EventEmitter<void> = new EventEmitter<void>(); // Event untuk idle

  constructor() {
    this.resetTimer();
    this.addEventListeners();
  }

  private addEventListeners() {
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer());
    });
  }

  private resetTimer() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.onIdle(), this.idleTime);
  }

  private onIdle() {
    // alert('Anda telah tidak aktif selama 15 menit! Silakan lanjutkan aktivitas.');
    // Tambahkan logika lain seperti logout otomatis atau redirect
    this.onIdleEvent.emit(); // Memicu event saat idle
  }
}
