export const config = {
  api: {
    bodyLimit: {
      sizeLimit: '5mb',
    },
  },
}

export default (req, res) => {
  let body = '.'.repeat(6 * 1024 * 1024)
  res.send(body)
}
