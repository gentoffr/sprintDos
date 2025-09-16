import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, Toast } from '../services/toast.service';
import { Subscription, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
interface ToastWithState extends Toast {
  state: 'enter' | 'exit';
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  imports: [CommonModule],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastWithState[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toast) => {
      this.showToast(toast);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showToast(toast: Toast) {
    const toastWithState: ToastWithState = { ...toast, state: 'enter' };
    this.toasts.push(toastWithState);

    const duration = toast.duration ?? 3000;

    // Después de la duración, activar animación de salida
    setTimeout(() => {
      toastWithState.state = 'exit';

      // Eliminar el toast después de la animación
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t !== toastWithState);
      }, 300); // coincide con la duración de slideOut
    }, duration);
  }
}
