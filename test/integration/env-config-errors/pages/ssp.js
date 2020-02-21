export const config = {
  env: ['NOTION_KEY', 'SENTRY_DSN', 'DATABASE_KEY', 'DATABASE_USER'],
}

// eslint-disable-next-line camelcase
export async function unstable_getServerProps({ env }) {
  return {
    // Do not pass any sensitive values here as they will
    // be made PUBLICLY available in `pageProps`
    props: { env },
  }
}

export default ({ env }) => <p>{JSON.stringify(env)}</p>
