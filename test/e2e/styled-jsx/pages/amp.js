import { Button } from 'test/e2e/styled-jsx/app/my-comps/button'

export const config = { amp: true }

export default function page() {
  return (
    <>
      <p>Hello world</p>
      <Button>Click me</Button>
    </>
  )
}
