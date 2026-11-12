import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/ui/button/button';

/** "No permission" page (SYS-01, 403). The full error pages come with US-036. */
@Component({
  selector: 'app-forbidden-page',
  imports: [Button, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forbidden-page.html',
  styleUrl: './forbidden-page.css',
})
export class ForbiddenPage {}
