# cap

Simple cli arguments parser written in TypesScript for node/Deno

[![npm](https://img.shields.io/npm/v/@mamoruds/cap.svg?style=flat-square)](https://www.npmjs.com/package/@mamoruds/cap)

## Installation

### nodejs

```shell
npm i @mamoruds/cap
```

### Deno

```typescript
import { Cap } from 'https://deno.land/x/cap/cap-deno.ts'
```

## Usage

```typescript
import { Cap } from '@mamoruds/cap'

const cap = new Cap({
    name: {
        alias: 'n',
        type: 'string',
        optional: false,
        about: 'some description about field "name"',
    },
    age: {
        type: 'string',
        optional: true,
        about: 'some description about field "age"',
    },
    silent: {
        alias: 's',
        type: 'boolean',
        optional: true,
        default: true,
        about: 'enable/disable silent',
    },
})
    .about('cap-js-example-node')
    .parse(process.argv.slice(2))

console.log(cap)

// $ node script.js -n mamoru --no-silent
// or using Deno
// $ deno run script.js -n mamoru --no-silent
// output
// { name: 'mamoru', silent: false, age: undefined }
```

## License

MIT © MamoruDS
