import { readFiles, computeDiffs, writeToFile } from './rsnUtil'
import colors from 'colors/safe'

// Perform read-compute-write atomically within a single async block
void (async () => {
  try {
    const keys = readFiles()
    const data = await computeDiffs(keys)
    writeToFile(data)
    console.log(`${colors.bold('All file diffs have been locked!')} Commit changed cache.json to git.`)
  } catch (err) {
    console.log(err)
    process.exitCode = 1
  }
})()
