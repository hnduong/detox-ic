const axios = require('axios')

const ACTIONS = require('./actions')

const port = require('./server')

const configuration = process.argv
  .slice(2)
  .find(c => c.indexOf('ios.sim.') > -1)

const isVerbose = process.argv.find(c => c.indexOf('-v') > -1)

const log = (...args) => {
  isVerbose && console.log(...args)
}

let defaultAttempts = 100

if (process.argv.indexOf('--attempts') > -1) {
  defaultAttempts = Number(process.argv[process.argv.indexOf('--attempts') + 1])
}

log(`***************Attempts: ${defaultAttempts}***************`)

// node_modules/.bin/mocha e2e --opts e2e/mocha.opts --configuration ios.sim.sim1.debug
// configuration => ios.sim.sim1.debug

const request = async (action, event) => {
  try {
    const url = `http://localhost:${port}/?action=${action}&configuration=${configuration}&payload=${event}`
    log(`**********Requesting: ${url}************`)
    const res = await axios(url)
    log(`**********${res.data}**********`)
    return JSON.stringify(res.data)
  } catch (e) {
    throw e
  }
}

const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

request(ACTIONS.REGISTER)

module.exports = {
  ACTIONS,
  async waitUntil(eventName) {
    let attempts = 0
    const check = async () => {
      const res = await request(ACTIONS.CHECK, eventName)
      log(res)
      if (res === 'true') {
        log(`********************${eventName} synced********************`)
        return true
      }
      log(`********************${eventName} ${configuration} is not synced yet.********************`)
      if (attempts < defaultAttempts) {
        await delay(2000)
        attempts++
        return check()
      }
      throw new Error(`[${configuration}] Couldn't sync ${eventName} after ${attempts} attempts`)
    }
    return await check()
  },
  async report(eventName) {
    return request(ACTIONS.REPORT, eventName)
  },
  async syncEvent(eventName) {
    await this.report(eventName)
    await this.waitUntil(eventName)
  },
  shareVar(name, value) {
    return request(ACTIONS.SHARE, encodeURIComponent(`{"${name}":"${value}"}`))
  },
  async getSharedVars() {
    const text = await request(ACTIONS.GET_SHARED)
    return JSON.parse(text)
  }
}
