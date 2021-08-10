import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'

const countAtom = atom(0)

export const getServerSideProps: GetServerSideProps<{ initialCount: number }> = async (context) => {
  return { props: { initialCount: 42 } }
}

export default function Home({ initialCount }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useHydrateAtoms([[countAtom, initialCount]] as const)
  const [count] = useAtom(countAtom)
  return (
    <div className={styles.container}>
      <Head>
        <title>Cwith-jotai</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.title}>
        With Jotai example
      </h1>
      <main className={styles.main}>
        <p>
          Count from the server: {count}
        </p>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
