// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from "react";

const CountContext = React.createContext();

function CountProvider(props) {
  const [count, setCount] = React.useState(0);
  const value = [count, setCount];

  return <CountContext.Provider value={value} {...props} />
}

function useCountContext() {
  const context = React.useContext(CountContext);

  if (!context) {
    throw new Error("useCountContext must be used within a CountProvider component");
  }

  return context;
}

function CountDisplay() {
  const [count] = useCountContext();

  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = useCountContext();
  const increment = () => setCount(c => c + 1);

  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
