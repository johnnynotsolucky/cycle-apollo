import xs from 'xstream'
import { createStore, combineReducers, applyMiddleware } from 'redux'

const responseFilter = category => response$ =>
  response$.options && response$.options.category === category

const producer = observable => {
  let subscription
  return {
    start(listener) {
      subscription = observable.subscribe({
        next(val) {
          listener.next(val)
        }
      })
    },
    stop() {
      subscription.unsubscribe()
    }
  }
}

const createApolloStore = client =>
  createStore(
    combineReducers({ apollo: client.reducer() }),
    {},
    applyMiddleware(client.middleware())
  )

export function makeApolloDriver(client) {

  return function apolloDriver(input$) {
    const queryResponse$$ = input$
      .filter(input => input.query)
      .map(options => {
        const response$ = xs.create(producer(client.watchQuery(options)))
          .map(results => {
            const key = Object.keys(results.data)[0]
            return results.data[key]
          })
        response$.options = options
        return response$
      })

    const mutation$ = input$
      .filter(input => input.mutation)
      .map(options => {
        const response$ = xs.from(client.mutate(options))
        response$.options = options
        return response$
      })

    const response$$ = xs.merge(queryResponse$$, mutation$)

    response$$.subscribe({})

    response$$.select = (category) =>
      category ?
      response$$.filter(responseFilter(category)) :
      response$$

    return response$$
  }
}
