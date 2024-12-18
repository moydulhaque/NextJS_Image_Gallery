import { connection } from 'next/server'

export default async function Page() {
  await connection()
  return <div id="page-content">Page content</div>
}
