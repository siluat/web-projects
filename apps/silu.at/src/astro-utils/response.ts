export function build404Response() {
  return new Response(null, {
    status: 404,
    statusText: 'Not found',
  })
}
