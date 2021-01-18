import { UTILS, Cap } from './src/cap.ts'
import * as utils from './src/utils.ts'

utils.PLAT.args = Deno.args
utils.PLAT.stdout = {} as { write: () => void }
utils.PLAT.stdout.write = (out: string) => {
    Deno.stdout.writeSync(new TextEncoder().encode(out))
}
utils.PLAT.exit = Deno.exit

UTILS.print = utils.print
UTILS.println = utils.println
UTILS.exit = utils.exit
UTILS.panic = utils.panic
UTILS.deepCopy = utils.deepCopy

export { Cap }
