import * as Joi from '@hapi/joi'
import { NowRequest, NowResponse } from '@now/node'
import chrome from 'chrome-aws-lambda'
import { STATUS_CODES } from 'http'
import puppeteer from 'puppeteer-core'
import { parse as parseURL } from 'url'
import { v4 as uuidV4 } from 'uuid'


interface ScreenshotOptions {
  src: string
  selector?: string
  viewportWidth?: number
  viewportHeight?: number
  fullPage?: boolean
  omitBackground?: boolean
}

async function getScreenshot(args: ScreenshotOptions): Promise<Buffer> {
  console.log('Params for screenshot', args) // tslint:disable-line:no-console

  const {
    src,
    selector,
    viewportWidth: width = 800,
    viewportHeight: height = 600,
    fullPage = true,
    omitBackground = false
  } = args
  await chrome.font('wenquan.ttc');
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
    defaultViewport: {
      width,
      height
    }
  })
  const page = await browser.newPage()
  let screenshot: Buffer

  await page.goto(src)

  if (selector) {
    const el = await page.$(selector)

    if (!el) {
      const error = new Error(
        `Element with selector ${selector} not found on page ${src}`
      ) as Error & { statusCode: number }
      error.statusCode = 400
      return Promise.reject(error)
    }

    screenshot = await el.screenshot({
      encoding: 'binary',
      omitBackground
    })
  } else {
    screenshot = await page.screenshot({
      encoding: 'binary',
      fullPage,
      omitBackground
    })
  }

  await browser.close()
  return screenshot
}

function parseQueryParams(query: object): ScreenshotOptions {
  const RawQueryParamsSchema = Joi.object().keys({
    src: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .required(),
    selector: Joi.string()
      .min(1)
      .optional(),
    viewportWidth: Joi.number()
      .positive()
      .integer()
      .greater(0)
      .optional(),
    viewportHeight: Joi.number()
      .positive()
      .integer()
      .greater(0)
      .optional(),
    fullPage: Joi.bool().optional(),
    omitBackground: Joi.bool().optional()
  })
  const result = Joi.validate(query, RawQueryParamsSchema, {
    abortEarly: false,
    convert: true // parse the values into the types they have been described as
  })

  if (result.error) {
    ;(result.error as Joi.ValidationError & { statusCode: number }).statusCode = 400
    result.error.message = result.error.message.replace('child', 'query param')
    throw result.error
  }

  const parsedValue = (result.value as unknown) as ScreenshotOptions

  console.log('Parsed query params ->', parsedValue) // tslint:disable-line:no-console

  return parsedValue
}
exports.handler = async function http (request) {
  let response = { ok: true }
  return response
}
