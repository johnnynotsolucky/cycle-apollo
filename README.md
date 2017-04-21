# cycle-apollo

## Usage

### Installation

```
npm install cycle-apollo
```

### Example

```
const main = ({ DOM, Apollo }) => {
  const query$ = xs.of({
    query: gql`
      query usersList {
        allUsers {
          id,
          name
        }
      }`,
      category: 'allusers'
  })

  const results$ = Apollo.select('allusers')
    .startWith(xs.of([]))
    .flatten()

  const vdom$ = results$
    .map(users =>
      ul(users.map(user => li(user.name)))
    )

  return {
    DOM: vdom$,
    Apollo: query$
  }
}
```

## Development

### Demo

```
npm run graphql
npm run dev
```

The demo uses [graphql-up](https://graph.cool/graphql-up/) to create a backend on Graphcool. Therefore, you only need to run
`graphql` once, or when the endpoint has expired.

### Build

#### Node Module

```
make lib
```

#### Browser

```
make dist
```