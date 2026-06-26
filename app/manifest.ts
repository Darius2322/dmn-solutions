// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'DMN Solutions Kenya',
    short_name:       'DMN Solutions',
    description:      'Innovative IT Solutions — Web, Mobile, Cloud, Networks & Electrical. Nairobi, Kenya.',
    start_url:        '/',
    display:          'standalone',
    orientation:      'portrait-primary',
    background_color: '#07070f',
    theme_color:      '#2563eb',
    categories:       ['business', 'productivity', 'utilities'],
    lang:             'en-KE',
    dir:              'ltr',
    scope:            '/',
    icons: [
      {
        src:     '/icons/icon-72x72.png',
        sizes:   '72x72',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-96x96.png',
        sizes:   '96x96',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-128x128.png',
        sizes:   '128x128',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-144x144.png',
        sizes:   '144x144',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-152x152.png',
        sizes:   '152x152',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-192x192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-384x384.png',
        sizes:   '384x384',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-maskable-192x192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icons/icon-maskable-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src:          '/screenshots/home.png',
        sizes:        '390x844',
        type:         'image/png',
        // @ts-expect-error – form_factor is valid in PWA spec
        form_factor:  'narrow',
        label:        'DMN Solutions Home',
      },
      {
        src:          '/screenshots/admin.png',
        sizes:        '390x844',
        type:         'image/png',
        // @ts-expect-error
        form_factor:  'narrow',
        label:        'Admin Dashboard',
      },
    ],
    shortcuts: [
      {
        name:      'Request a Service',
        short_name:'Request',
        description:'Submit a service request to DMN Solutions',
        url:       '/#services',
        icons:     [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name:      'My Account',
        short_name:'Account',
        description:'View your DMN Solutions profile',
        url:       '/profile',
        icons:     [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name:      'WhatsApp Us',
        short_name:'WhatsApp',
        description:'Chat with DMN Solutions support',
        url:       'https://wa.me/254110554040',
        icons:     [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
  };
}
