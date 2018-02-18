const { parse } = require('url')

const { json, send, createError } = require('micro')
const moment = require('moment')
const nunjucks = require('nunjucks')

global.data = {
  captcha: 'NULL',
  time: 'NULL',
}
nunjucks.configure('.', {
  autoescape: true,
})
moment.locale('zh-cn')

const update = async request => {
  const sms = await json(request)

  if (sms.secret !== '5t9eM2byCnlfAWVp7vEcN9O/RvDVSQZX84qXt8I9mQc')
    throw createError(403, 'Wrong secret')

  if (sms.content === '' || sms.time === '')
    throw createError(400, 'Not validated request')

  const captcha = sms.content.match(/【115科技】验证码(\d+).+/i)
  if (captcha === null) throw createError(400, "Can't find captcha")

  data = {
    captcha: captcha[1],
    time: moment()
      .utcOffset(8)
      .format('LLL'),
  }
}

const app = async (request, response) => {
  const url = parse(request.url)
  if (url.pathname === '/' && request.method === 'POST') await update(request)

  return nunjucks.render('app.nj', data)
}

module.exports = app
