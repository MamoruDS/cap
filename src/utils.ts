export type Plat = {
    exit: (code: number) => never
    stdout: {
        write: (out: string) => void
    }
    args: string[]
}

const PLAT = {} as Plat

const print = (output: string): void => {
    PLAT.stdout.write(output)
}

const println = (output: string): void => {
    print(output + '\n')
}

const exit = (code = 0): never => {
    return PLAT.exit(code) as never
}

const panic = (message: {
    ok?: boolean
    description?: string
    error?: Error
}): never => {
    console.error({ ok: false, ...message })
    return exit(1)
}

type _HashMap = { [key in string | number]: any }

const copy = <T>(source: T): T => {
    if (source == null) return source
    else if (Array.isArray(source)) {
        const _t = [] as any[]
        source.forEach((v) => {
            _t.push(copy(v))
        })
        return _t as any
    } else if (typeof source === 'object') {
        // https://github.com/Microsoft/TypeScript/issues/6373
        const _s = source as { constructor: { name?: string } }
        if (_s.constructor.name !== 'Object') {
            return source
        } else {
            const _s = source as _HashMap
            const _t = {} as _HashMap
            for (const key of Object.keys(_s)) {
                _t[key] = copy(_s[key])
            }
            return _t as T
        }
    }
    return source
}

const deepCopy = <T extends _HashMap>(source: T): T => {
    if (typeof source != 'object' || source === null || Array.isArray(source)) {
        throw new TypeError()
    }
    if (source == {}) {
        return {} as T
    }
    const _t = {} as _HashMap
    for (const key of Object.keys(source)) {
        _t[key] = copy(source[key])
    }
    return _t as T
}

export { PLAT }

export { print, println, panic, deepCopy, exit }
