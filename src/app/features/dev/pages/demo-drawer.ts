import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DrawerLayout } from '../../../shared/ui';

/** Sample drawer content for the `/dev/ui` showcase (shape of the public ☰ menu, PUB-09). */
@Component({
  selector: 'app-demo-drawer',
  imports: [DrawerLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  templateUrl: './demo-drawer.html',
  styleUrl: './demo-drawer.css',
})
export class DemoDrawer {
  static readonly titleId = 'app-demo-drawer-title';

  protected readonly titleId = DemoDrawer.titleId;
  protected readonly links = [
    'Explorar eventos',
    'Recuperar mi inscripción',
    'Ingresar',
    'Crear cuenta',
    'Términos',
    'Privacidad',
  ];
}
