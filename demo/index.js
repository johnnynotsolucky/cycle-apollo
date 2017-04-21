import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { div, ul, li, input } from '@cycle/dom'
import ApolloClient, {createNetworkInterface} from 'apollo-client'
import gql from 'graphql-tag'
import { makeApolloDriver } from '../src'
import './main.styl'

const fetchUsers = gql`
  query usersList {
    allUsers {
      id,
      name
    }
  }`

const addUser = gql`
  mutation ($name: String!) {
    createUser(
      name: $name
    ) {
      id,
      name
    }
  }`

const main = ({ DOM, Apollo }) => {
  const addName$ = DOM.select('.name').events('keyup')
    .filter(ev => ev.keyCode === 13)
    .map(ev => {
      const name = ev.target.value
      ev.target.value = '' // Side-effect
      return {
        mutation: addUser,
        variables: { name },
        updateQueries: {
          usersList: (prev, { mutationResult }) => ({
            allUsers: [
              ...prev.allUsers,
              mutationResult.data.createUser
            ]
          })
        },
        category: 'createName'
      }
    })

  const query$ = xs.of({
    query: fetchUsers,
    category: 'users'
  })

  const data$ = Apollo.select('users')
    .startWith(xs.of([]))
    .flatten()

  const vdom$ = data$
    .map(data =>
      div('.container', [
        input('.name', { attrs: {
          type: 'text',
          placeholder: 'Create User'
        }}),
        ul(data.map(item => li(item.name)))
      ])
    )

  return {
    DOM: vdom$,
    Apollo: xs.merge(addName$, query$)
  }
}

const networkInterface = createNetworkInterface({
  uri: process.env.GRAPHQL_ENDPOINT
})

const client = new ApolloClient({ networkInterface })
run(main, {
  DOM: makeDOMDriver('#app'),
  Apollo: makeApolloDriver(client)
})
