# cap

Simple cli arguments parser written in TypesScript for node/Deno

## Installation

### nodejs

```shell
npm i cap-js
```

### Deno

```typescript

```

## Usage

```typescript
import { Cap } from 'cap-js'

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
```

## License

MIT © MamoruDS
