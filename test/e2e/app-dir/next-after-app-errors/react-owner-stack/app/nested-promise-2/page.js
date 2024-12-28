import { after } from 'next/server'
import { setTimeout } from 'timers/promises'

export default function Page() {
  return <Wrapper />
}

function Wrapper() {
  return <Inner />
}

function Inner() {
  foo()
  return null
}

function foo() {
  after(bar())
}

async function bar() {
  await setTimeout(0)
  after(zap())
}

async function zap() {
  await setTimeout(0)
  throws()
}

function throws() {
  throw new Error('kaboom')
}
