import { expirePath as revalidatePathAlias } from 'next/cache'

export async function GET() {
  revalidatePathAlias('tag')
}
