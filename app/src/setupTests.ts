// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import {act} from '@testing-library/react'
import 'fake-indexeddb/auto'

// general cleanup
beforeEach(async () => {
  // queryCache.clear();
  // react-query turn off network error logging
})

// real times is a good default to start, individual tests can
// enable fake timers if they need, and if they have, then we should
// run all the pending timers (in `act` because this can trigger state updates)
// then we'll switch back to realTimers.
// it's important this comes last here because jest runs afterEach callbacks
// in reverse order and we want this to be run first so we get back to real timers
// before any other cleanup
afterEach(async () => {
  // waitFor is important here. If there are queries that are being fetched at
  // the end of the test and we continue on to the next test before waiting for
  // them to finalize, the tests can impact each other in strange ways.
  //   await waitFor(() => expect(queryCache.isFetching).toBe(0));
  if (jest.isMockFunction(setTimeout)) {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  }

  /* setLogger({
    log: console.log,
    warn: console.warn,
    error: () => {},
  }) */
})
