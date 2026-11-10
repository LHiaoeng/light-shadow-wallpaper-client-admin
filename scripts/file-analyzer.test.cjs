const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/components/FileAnalyzer/index.vue'),
  'utf8'
)
const logic = source.slice(
  source.indexOf('function getCleanUrl'),
  source.indexOf('/** 从 text/html')
)
const { outputText } = ts.transpileModule(logic, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 }
})
const fileUrl = { value: '' }
const fileInfo = { value: null }
const addFileUrl = new Function('fileUrl', 'fileInfo', `${outputText}\nreturn addFileUrl`)(
  fileUrl,
  fileInfo
)

const original = 'https://i1.hdslb.com/bfs/new_dyn/ff63968f6253e7f5338f04c89c54bbe2473940554.jpg'
const thumbnail = `${original}@1052w_!web-dynamic.avif`
for (const [input, expected] of [
  [thumbnail, { url: original, poster: thumbnail }],
  [
    `${original}?x-oss-process=image/resize,w_200`,
    { url: `${original}?x-oss-process=image/resize,w_200`, poster: '' }
  ],
  [
    `${original}?imageView2/2/w/200&download=1`,
    { url: `${original}?imageView2/2/w/200&download=1`, poster: '' }
  ],
  [
    `${original}?imageMogr2/thumbnail/200x&name=a%20b`,
    { url: `${original}?imageMogr2/thumbnail/200x&name=a%20b`, poster: '' }
  ],
  [`${thumbnail}?token=abc`, { url: `${thumbnail}?token=abc`, poster: '' }],
  [
    `${original}?x-oss-process=image/resize,w_200&Signature=abc`,
    { url: `${original}?x-oss-process=image/resize,w_200&Signature=abc`, poster: '' }
  ],
  [
    `${thumbnail}?download=1#preview`,
    { url: `${original}?download=1#preview`, poster: `${thumbnail}?download=1#preview` }
  ],
  ['not a url', { url: 'not a url', poster: '' }],
  [original, { url: original, poster: '' }],
  [
    'https://example.com/image.jpg@small',
    { url: 'https://example.com/image.jpg', poster: 'https://example.com/image.jpg@small' }
  ],
  [
    'https://example.com/image.jpg?user=a@b',
    { url: 'https://example.com/image.jpg?user=a@b', poster: '' }
  ],
  [
    'https://example.com/a.jpg@https://example.com/b.jpg',
    {
      url: 'https://example.com/a.jpg@https://example.com/b.jpg',
      poster: ''
    }
  ]
]) {
  fileUrl.value = input
  addFileUrl()
  assert.deepEqual(fileInfo.value, expected)
}
for (const extension of [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'avif',
  'bmp',
  'svg',
  'tif',
  'tiff',
  'ico',
  'heic',
  'heif',
  'jxl',
  'apng',
  'psd',
  'RAW',
  'future',
  ''
]) {
  const url = `https://example.com/image${extension ? `.${extension}` : ''}`
  fileUrl.value = `${url}@1052w_!web-dynamic.avif`
  addFileUrl()
  assert.deepEqual(fileInfo.value, { url, poster: fileUrl.value })
}

fileUrl.value = 'https://user@example.com/image.png'
addFileUrl()
assert.deepEqual(fileInfo.value, { url: fileUrl.value, poster: '' })
console.log('file analyzer tests passed')
