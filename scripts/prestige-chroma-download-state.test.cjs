const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const sourcePath = path.resolve(
  __dirname,
  '../src/views/lol/prestigeChroma/prestigeChromaDownloadState.ts'
)
const source = fs.readFileSync(sourcePath, 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
})
const loadedModule = { exports: {} }
new Function('module', 'exports', 'require', outputText)(
  loadedModule,
  loadedModule.exports,
  require
)

const { snapshotPrestigeChromaQuery, buildPrestigeChromaCountPageParam } = loadedModule.exports
const query = { gameVer: '26.14', isNew: 1 }
const snapshot = snapshotPrestigeChromaQuery(query)
query.gameVer = '26.15'

assert.deepEqual(snapshot, { gameVer: '26.14', isNew: 1 })
assert.deepEqual(buildPrestigeChromaCountPageParam(snapshot), {
  gameVer: '26.14',
  isNew: 1,
  current: 1,
  size: 1
})

const modalSource = fs.readFileSync(
  path.resolve(__dirname, '../src/views/lol/prestigeChroma/PrestigeChromaImageDownloadModal.vue'),
  'utf8'
)
assert.equal(
  modalSource.includes('<template #action>'),
  false,
  'Ant Design Vue 3.2 Alert does not render an action slot'
)
assert.match(modalSource, /class="scope-actions"/)
console.log('prestige chroma download state tests passed')
