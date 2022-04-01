// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from "react";
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from "../pokemon";

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false);

  // To make this even better, replace "useEffect" with "useLayoutEffect" hook to
  // make sure that you are correctly setting the mountedRef.current immediately
  // after React updates the DOM
  React.useEffect(() => {
    // Gets called on mount, so set mountedRef to true
    mountedRef.current = true;

    // Return cleanup function that gets called on unmount, so set mountedRef to false
    return () => {
      mountedRef.current = false;
    }
  }, []);

  return React.useCallback(
    (...args) => {
      if (mountedRef.current) {
        dispatch(...args);
      } else {
        console.log("Component unmounted, dispatch not sent");
      }
    },
    [dispatch]
  );
}

function asyncReducer(state, action) {
  switch (action.type) {
    case "pending": {
      return {status: action.type, data: null, error: null};
    }
    case "resolved": {
      return {status: action.type, data: action.data, error: null};
    }
    case "rejected": {
      return {status: action.type, data: null, error: action.error};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function useAsync(asyncCallback, initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: "idle",
    data: null,
    error: null,
    ...initialState,
  });

  const safeDispatch = useSafeDispatch(unsafeDispatch);
  const {status, data, error} = state;

  // Doing useCallback here means the user doesn't have to remember to this on their side, so you optimise it for them
  const run = React.useCallback(
    promise => {
      safeDispatch({type: "pending"});

      promise.then(
        data => {
          safeDispatch({type: "resolved", data})
        },
        error => {
          safeDispatch({type: "rejected", error})
        },
      );
    },
    [safeDispatch]);

  return {
    status,
    data,
    error,
    run,
  }
}

function PokemonInfo({pokemonName}) {
  const {data, status, error, run} = useAsync({
    status: pokemonName ? "pending" : "idle",
  });

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    }

    run(fetchPokemon(pokemonName));
  }, [pokemonName, run]);

  switch (status) {
    case "idle":
      return <span>Submit a pokemon</span>;
    case "pending":
      return <PokemonInfoFallback name={pokemonName} />;
    case "rejected":
      throw error;
    case "resolved":
      return <PokemonDataView pokemon={data} />;
    default:
      throw new Error("This should be impossible");
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState("");

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
  }

  function handleReset() {
    setPokemonName("");
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{" "}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox;
