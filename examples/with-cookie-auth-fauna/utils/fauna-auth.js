import faunadb from 'faunadb'
import cookie from 'cookie'

export const FAUNA_SECRET_COOKIE = 'faunaSecret'

export const serverClient = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
})

// Used for any authed requests.
export const faunaClient = (secret, domain) =>
  new faunadb.Client({
    secret: secret,
    domain: domain
  })

export const resolveDbDomain = () => {
  if (process.env.FAUNA_DB_DOMAIN) {
    return Promise.resolve(process.env.FAUNA_DB_DOMAIN)
  } else {
    // Fallback to Classic region group
    return 'db.fauna.com'
  }
}

export const serializeFaunaCookie = (userSecret) => {
  const cookieSerialized = cookie.serialize(FAUNA_SECRET_COOKIE, userSecret, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })
  return cookieSerialized
}
