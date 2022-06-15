import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Shallow({ message }) {
  const { pathname, query } = useRouter()
  return (
    <div>
      <ul>
        <li id="message-contents">{message}</li>
        <li>
          <Link href="/sha?hello=world" shallow>
            <a id="shallow-link">Shallow link to /shallow?hello=world</a>
          </Link>
        </li>
        <li>
          <Link href="/sha?hello=goodbye">
            <a id="deep-link">Deep link to /shallo?hello=goodbye</a>
          </Link>
        </li>
        <li>
          <h1 id="pathname">
            Current path: <code>{pathname}</code>
          </h1>
        </li>
        <li>
          <h2 id="query" data-query-hello={query.hello}>
            Current query: <code>{JSON.stringify(query)}</code>
          </h2>
        </li>
      </ul>
    </div>
  )
}

let i = 0

export const getServerSideProps = () => {
  return {
    props: {
      message: `Random: ${++i}${Math.random()}`,
    },
  }
}
