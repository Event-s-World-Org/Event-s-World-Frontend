import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../auth/services/auth.store';

@Component({
  selector: 'app-explore-events-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './explore-events.page.html',
  styleUrl: './explore-events.page.css',
})
export class ExploreEventsPage {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate(['/panel/eventos']);
    }
  }
}
