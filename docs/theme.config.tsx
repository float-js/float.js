import { useRouter } from 'next/router';
import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>⚡ Float.js</span>,
  project: {
    link: 'https://github.com/float-js/float-js',
  },
  docsRepositoryBase: 'https://github.com/float-js/float-js/tree/main/docs',
  footer: {
    text: 'Float.js - The React framework for the AI era',
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Float.js',
      };
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Float.js" />
      <meta property="og:description" content="The React framework for the AI era" />
    </>
  ),
};

export default config;
