import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'e/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'legal/terminos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'legal/privacidad',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
