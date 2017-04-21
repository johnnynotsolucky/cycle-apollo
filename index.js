'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeApolloDriver = makeApolloDriver;

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var responseFilter = function responseFilter(category) {
  return function (response$) {
    return response$.options && response$.options.category === category;
  };
};

var producer = function producer(observable) {
  var subscription = void 0;
  return {
    start: function start(listener) {
      subscription = observable.subscribe({
        next: function next(val) {
          listener.next(val);
        }
      });
    },
    stop: function stop() {
      subscription.unsubscribe();
    }
  };
};

var createApolloStore = function createApolloStore(client) {
  return (0, _redux.createStore)((0, _redux.combineReducers)({ apollo: client.reducer() }), {}, (0, _redux.applyMiddleware)(client.middleware()));
};

function makeApolloDriver(client) {
  var store = createApolloStore(client);
  client.setStore(store);

  return function apolloDriver(input$) {
    var queryResponse$$ = input$.filter(function (input) {
      return input.query;
    }).map(function (options) {
      var response$ = _xstream2.default.create(producer(client.watchQuery(options))).map(function (results) {
        var key = Object.keys(results.data)[0];
        return results.data[key];
      });
      response$.options = options;
      return response$;
    });

    var mutation$ = input$.filter(function (input) {
      return input.mutation;
    }).map(function (options) {
      var response$ = _xstream2.default.from(client.mutate(options));
      response$.options = options;
      return response$;
    });

    var response$$ = _xstream2.default.merge(queryResponse$$, mutation$);

    response$$.subscribe({});

    response$$.select = function (category) {
      return category ? response$$.filter(responseFilter(category)) : response$$;
    };

    return response$$;
  };
}
//# sourceMappingURL=index.js.map