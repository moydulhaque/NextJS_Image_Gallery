export async function getServerSideProps() {
  return {
    props: {
      message: 'hello from page',
    },
  }
}

export default function nestedPage(props) {
  return (
    <>
      <p id="page-message">{props.message}</p>
    </>
  )
}
