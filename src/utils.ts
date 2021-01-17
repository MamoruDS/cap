import { exit as _exit, stdout } from 'process'

const print = (output: string): void => {
    stdout.write(output)
}

const println = (output: string): void => {
    print(output + '\n')
}

const exit = (code: number) => {
    _exit(code)
}

const panic = (message: {
    ok?: boolean
    description?: string
    error?: Error
}) => {
    console.error({ ok: false, ...message })
    exit(1)
}

const copy = <T>(source: T): T => {
    if (source == null) return source
    if (Array.isArray(source)) {
        const _t = [] as any[]
        source.forEach((v) => {
            _t.push(copy(v))
        })
        return _t as any
    }
    if (typeof source === 'object') {
        if (source.constructor.name !== 'Object') {
            return source
        }
        const _t = {} as T
        for (const key of Object.keys(source)) {
            _t[key] = copy(source[key])
        }
        return _t
    }
    return source
}

const deepCopy = <T extends object>(source: object): T => {
    if (typeof source != 'object' || source === null || Array.isArray(source)) {
        throw new TypeError()
    }
    if (source == {}) {
        return {} as T
    }
    const _t = {} as T
    for (const key of Object.keys(source)) {
        _t[key] = copy(source[key])
    }
    return _t
}

export { print, println, panic, deepCopy, exit }
