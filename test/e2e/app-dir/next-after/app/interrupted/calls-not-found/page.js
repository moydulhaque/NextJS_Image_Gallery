import { notFound } from 'next/navigation'
import { unstable_after as after } from 'next/server'
import { persistentLog } from '../../../utils/log'

export default function Page() {
  after(() => {
    persistentLog({
      source: '[page] /interrupted/calls-not-found',
    })
  })
  notFound()
}
