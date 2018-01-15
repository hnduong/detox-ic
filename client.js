const axios = require('axios')

const port = require('./server')

const configuration = process.argv
  .slice(2)
  .find(c => c.indexOf('ios.sim.') > -1)

async function request (action, event) {
  try {
    const res = await axios(`http://localhost:${port}/?action=${action}&configuration=${configuration}&payload=${event}`)
    return JSON.stringify(res.data)
  } catch (e) {
    throw e
  }
}

const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

request('register')

module.exports = {
  async waitUntil (eventName) {
    let attempts = 0
    const check = async () => {
      const res = await request('check', eventName)
      if (res === 'true') {
        console.log(`********************${eventName} synced********************`)
        return true
      }
      console.log(
        `********************${eventName} ${configuration} is not synced yet.********************`
      )
      if (attempts < 100) {
        await delay(500)
        attempts++
        return check()
      }
      throw new Error(
        `[${configuration}] Couldn't sync ${eventName} after 10 attempts`
      )
    }
    return await check()
  },
  async report (eventName) {
    return request('report', eventName)
  },
  async syncWithEvent (eventName) {
    await this.report(eventName)
    await this.waitUntil(eventName)
  },
  shareVar (name, value) {
    return request('share', encodeURIComponent(`{"${name}":"${value}"}`))
  },
  async getSharedVars () {
    const text = await request('get_shared')
    return JSON.parse(text)
  }
}
