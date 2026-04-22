export type Route =
  | { page: 'home' }
  | { page: 'article'; id: string }
  | { page: 'works' }
  | { page: 'project'; id: string }
  | { page: 'about' }
  | { page: 'tags' }
  | { page: 'search'; q?: string }
  | { page: 'admin' };

export function routeToPath(r: Route): string {
  switch (r.page) {
    case 'home':    return '/';
    case 'article': return `/article/${r.id}`;
    case 'works':   return '/works';
    case 'project': return `/project/${r.id}`;
    case 'about':   return '/about';
    case 'tags':    return '/tags';
    case 'search':  return r.q ? `/search?q=${encodeURIComponent(r.q)}` : '/search';
    case 'admin':   return '/admin';
  }
}
