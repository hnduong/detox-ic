/* @flow */
const http = require('http')
const { URL } = require('url')
const ACTIONS = require('./actions')
const port = 8335
const DEBUG = false

const globalState = {}

const requestHandler = (request, response) => {
  const searchParams /*: any */ = new URL(request.url, 'http://localhost/')
    .searchParams

  const action = searchParams.get('action')
  const configuration = searchParams.get('configuration')
  const payload = searchParams.get('payload')

  if (DEBUG) {
    console.log(
      `********[SYNC_SERVER][${configuration}] action:`,
      action,
      'payload: ',
      payload,
      '********'
    )
    console.log(`********[SYNC_SERVER][${configuration}] before`, globalState, '********')
  }

  switch (action) {
    case ACTIONS.REGISTER:
      globalState[configuration] = {
        events: [],
        shared: {}
      }
      response.end(configuration + ' is registered')
      break
    case ACTIONS.REPORT:
      globalState[configuration].events = globalState[configuration].events
        .filter(e => e !== payload)
        .concat([payload])
      response.end(payload + ' is registered')
      break
    case ACTIONS.SHARE: {
      const shared = JSON.parse(decodeURIComponent(payload))
      globalState[configuration].shared = {
        ...globalState[configuration].shared,
        ...shared
      }
      response.end(payload + ' is shared')
      break
    }
    case ACTIONS.GET_SHARED:
      const otherSideKey = Object.keys(globalState).find(
        key => key !== configuration
      )

      if (!otherSideKey || !globalState[otherSideKey]) {
        response.end('{}')
        break
      }
      response.end(JSON.stringify(globalState[otherSideKey].shared))
      break
    case ACTIONS.CHECK:
      // check if this event happened with all clients
      const allCompleted =
        Object.values(globalState).filter(
          (e /*: any */) => e.events.indexOf(payload) > -1
        ).length === Object.keys(globalState).length
      response.end(allCompleted.toString())
      break
    default:
      response.end('Hello Node.js Server!')
  }
  if (DEBUG) {
    console.log(`=> [SYNC_SERVER][${configuration}] after`, globalState)
  }
}

async function start () {
  http
    .createServer(requestHandler)
    .once('error', err => console.log(err.code))
    .listen(port, err => {
      if (err) {
        return console.log('something bad happened', err)
      }
      console.log(`server is listening on ${port}`)
    })
}

start()
module.exports = port
