import { argv, stdout, exit } from 'process'

import { UTILS, Cap } from './cap'
import * as utils from './utils'

utils.PLAT.args = argv.slice(2)
utils.PLAT.stdout = {} as { write: () => void }
utils.PLAT.stdout.write = (out: string) => {
    stdout.write(out)
}
utils.PLAT.exit = exit

UTILS.print = utils.print
UTILS.println = utils.println
UTILS.exit = utils.exit
UTILS.panic = utils.panic
UTILS.deepCopy = utils.deepCopy

export { Cap }
