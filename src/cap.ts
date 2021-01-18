type Utils = {
    print: (out: string) => void
    println: (out: string) => void
    exit: (code: number) => never
    panic: (message: {
        ok?: boolean
        description?: string
        error?: Error
    }) => never
    deepCopy: <T>(object: T) => T
}

const UTILS = {} as Utils

const SEP_LEN = 2

type TypeConv<T> = T extends 'string'
    ? string
    : T extends 'boolean'
    ? boolean
    : T extends 'number'
    ? number
    : T extends 'array'
    ? string[]
    : never

type Option<
    T extends 'string' | 'boolean' | 'number' | 'array',
    C extends Options = {}
> = {
    type: T
    alias?: string
    default?: TypeConv<T>
    optional?: boolean
    about?: string
    fn?: (value: TypeConv<T>, Cap: Cap<C>) => Promise<void>
    _hide?: boolean
}

type Options = {
    [key: string]:
        | Option<'string'>
        | Option<'boolean'>
        | Option<'number'>
        | Option<'array'>
}

type OptionsVal<T extends Options> = {
    [key in keyof T]: TypeConv<T[key]['type']>
}

const parser = <T extends Options>(
    args: string[],
    options: T,
    Cap: Cap<T>
): OptionsVal<T> => {
    let _k: string | undefined
    const _args = {} as { [key: string]: any }
    const _opts = {} as { [key: string]: string }
    for (const key of Object.keys(options)) {
        _opts[key] = key
        _opts[options[key]?.alias ?? '_'] = key
    }
    delete _opts['_']

    const _add = (key?: string, val?: string) => {
        if (typeof key == 'undefined') {
            // key undefined
            UTILS.panic({ description: `No such sub-command '${val}'` })
        } else {
            const _key = _opts[key]
            const type = options[_key]?.type
            if (!type) {
                // key not defined
                UTILS.panic({ description: `Unknown option '${key}'` })
            }
            if (!val) {
                // init
                if (type != 'boolean') {
                    _k = _key
                    _args[_key] = null
                } else {
                    _args[_key] = true
                }
            } else {
                // add new val
                if (type == 'string') {
                    _args[_key] = val
                }
                if (type == 'number') {
                    _args[_key] = parseInt(val)
                }
                if (type == 'boolean') {
                    _args[_key] = val == 'true' ? true : false
                }
                if (type == 'array') {
                    if (!_args[_key]) _args[_key] = []
                    _args[_key].push(val)
                }
            }
        }
    }

    for (let a of args) {
        const r = new RegExp(/^([-]{1,2})([^\s|=]+)=?([^$]{0,})/)
        const m = r.exec(a)
        if (m == null) {
            _add(_k, a)
        } else {
            if (m[1].length == 1) {
                // -
                _k = undefined
                const _keys = m[2].split('')
                if (_keys.length > 1) {
                    for (const _key of _keys) {
                        _add(_key)
                    }
                    _k = undefined
                } else {
                    _add(m[2], m[3])
                }
            } else {
                // --
                if (m[2].substr(0, 3) == 'no-') {
                    _add(m[2].substr(3), 'false')
                } else {
                    _add(m[2], m[3])
                }
            }
        }
    }
    for (const key of Object.keys(options)) {
        const opt = options[key] as Option<'string'>
        if (typeof _args[key] == 'undefined') {
            if (!opt.optional) {
                UTILS.panic({
                    description: `Missing required argument: ${key}`,
                })
            }
            _args[key] = opt.default
        }
        if (opt.fn) {
            opt.fn(_args[key], Cap)
        }
        if (opt._hide) {
            delete _args[key]
        }
    }
    return _args as OptionsVal<T>
}

const BUILTIN = {
    help: {
        type: 'boolean',
        alias: 'h',
        optional: true,
        about: 'Display help message',
        fn: async (val: boolean, Cap: Cap<Options>) => {
            if (val) {
                const _join = (
                    input: (string | undefined)[],
                    separator: string
                ): string => {
                    return input
                        .filter((i) => typeof i != 'undefined')
                        .join(separator)
                }
                const _defaultParse = (
                    d?: string | number | boolean | string[]
                ): string | undefined => {
                    let _d: string | undefined
                    if (typeof d == undefined) {
                        //
                    } else if (typeof d == 'string') {
                        _d = `"${d}"`
                    } else if (typeof d == 'number') {
                        _d = d.toString()
                    } else if (typeof d == 'boolean') {
                        _d = d ? 'true' : 'false'
                    } else if (Array.isArray(d)) {
                        _d = `[${d.map((i) => _defaultParse(i)).join(', ')}]`
                    }
                    return _d
                }

                const lns: (string | undefined)[][] = []
                lns.push([Cap._name, Cap._version])
                lns.push([Cap._about])

                const _lns: string[] = []
                for (const li in lns) {
                    _lns.push(_join(lns[li], ' '))
                }

                const opts = Cap.options()
                const optlns: (string | undefined)[][] = []
                let mw = 0
                for (const opt of Object.keys(opts)) {
                    const sl0 = _join(
                        [
                            opts[opt].alias ? '-' + opts[opt].alias : undefined,
                            '--' + opt,
                        ],
                        ', '
                    )
                    const sl1 = opts[opt].about
                    const _d = _defaultParse(opts[opt].default)
                    const sl2 = _d ? ` [default: ${_d}]` : undefined
                    mw = mw < sl0.length ? sl0.length : mw
                    optlns.push([sl0, sl1, sl2])
                }
                for (const li in optlns) {
                    optlns[li].splice(
                        1,
                        0,
                        ' '.repeat(mw + SEP_LEN - (optlns[li][0]?.length ?? 0))
                    )
                }
                _lns.push(optlns.map((l) => _join(l, '')).join('\n'))

                UTILS.println(_lns.filter((l) => l.length).join('\n\n'))
                UTILS.exit(0)
            }
        },
        _hide: true,
    },
    version: {
        type: 'boolean',
        alias: 'V',
        optional: true,
        about: 'Display version info',
        fn: async (val: boolean, Cap: Cap<Options>) => {
            if (val) {
                const _join = (
                    input: (string | undefined)[],
                    separator: string
                ): string => {
                    return input
                        .filter((i) => typeof i != 'undefined')
                        .join(separator)
                }
                UTILS.println(_join([Cap._name, Cap._version], ' '))
                UTILS.exit(0)
            }
        },
        _hide: true,
    },
}

class Cap<T extends Options> {
    private _builtIn: Options
    _version?: string
    _name?: string
    _author?: string
    _about?: string
    _options: T
    constructor(options: T) {
        this._builtIn = UTILS.deepCopy(BUILTIN) as Options
        this._options = options
    }
    version(value: string): Cap<T> {
        this._version = value
        return this
    }
    name(value: string): Cap<T> {
        this._name = value
        return this
    }
    author(value: string): Cap<T> {
        this._author = value
        return this
    }
    about(value: string): Cap<T> {
        this._about = value
        return this
    }
    parse(args: string[]): OptionsVal<T> {
        return parser(args, this.options(), this)
    }
    disable<B extends keyof typeof BUILTIN>(option: B): Cap<T> {
        delete this._builtIn[option]
        return this
    }
    options(): T {
        for (const opt of Object.values(this._options)) {
            for (const _b of Object.keys(this._builtIn)) {
                if (this._builtIn[_b].alias == opt.alias) {
                    delete this._builtIn[_b].alias
                }
            }
        }
        return {
            ...this._builtIn,
            ...this._options,
        }
    }
}

export { UTILS, Cap }
