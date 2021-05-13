# ra-data-graphql-amplication

A GraphQL data provider for [react-admin](https://github.com/marmelab/react-admin/)
built for GraphQL API generated with [Amplication](https://amplication.com)

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Credits](#credits)

## Installation

Install with:

```sh
npm install --save graphql ra-data-graphql-amplication
```

or

```sh
yarn add graphql ra-data-graphql-amplication
```

## Usage

The `ra-data-graphql-amplication` package exposes a single function, which is a constructor for a `dataProvider` based on a GraphQL endpoint. When executed, this function calls the GraphQL endpoint, running an [introspection](https://graphql.org/learn/introspection/) query. It uses the result of this query (the GraphQL schema) to automatically configure the `dataProvider` accordingly.

```ts
// in graphqlDataProvider.ts
import buildGraphQLProvider from "ra-data-graphql-amplication";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";

const httpLink = createHttpLink({
  //@todo: get the url from a configuration file
  uri: "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  //@todo: get the authentication token from local storage
  const token = "YWRtaW46YWRtaW4=";
  return {
    headers: {
      ...headers,
      authorization: token ? `Basic ${token}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

export default buildGraphQLProvider({
  client: apolloClient,
});
```

```tsx
//in app.tsx
import React, { useEffect, useState } from "react";
import { Admin, DataProvider, Resource } from "react-admin";

import buildGraphQLProvider from "./graphqlDataProvider";
import basicHttpAuthProvider from "./auth-provider/ra-auth-basic-http";

import "./App.css";
import Dashboard from "./pages/Dashboard";

import { UserList } from "./User/UserList";
import { UserEdit } from "./User/UserEdit";
import { UserCreate } from "./User/UserCreate";

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
  useEffect(() => {
    buildGraphQLProvider
      .then((provider) => {
        setDataProvider(() => provider);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, []);
  if (!dataProvider) {
    return <div>Loading</div>;
  }
  return (
    <div className="App">
      <Admin
        title="My Admin"
        dataProvider={dataProvider}
        authProvider={basicHttpAuthProvider}
        dashboard={Dashboard}
      >
        <Resource
          name="User"
          list={UserList}
          edit={UserEdit}
          create={UserCreate}
        />
      </Admin>
    </div>
  );
}

export default App;
```

## Expected GraphQL Schema

The `ra-data-graphql-amplication` function works against GraphQL servers that was generated with Amplication, or respects its grammar.

## Options

### Customize the Apollo client

You can either supply the client options by calling `buildGraphQLProvider` like this:

```js
buildGraphQLProvider({
  clientOptions: { uri: "http://localhost:4000", ...otherApolloOptions },
});
```

Or supply your client directly with:

```js
buildGraphQLProvider({ client: myClient });
```

## Credits

This provider was built on top of the source code of `ra-data-graphql-simple`

https://github.com/marmelab/react-admin/tree/master/packages/ra-data-graphql-simple
