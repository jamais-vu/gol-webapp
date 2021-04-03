/* jshint esversion: 6 */

/* This module contains only one function.
 * I put it in its own module due to its complexity and its generality.
 */

/*
 * When the button is pressed, calls each function of the array runOnceFunctions
 * in order, and then repeatedly calls each function of the array
 * repeatedFunctions, with a certain delay, as long as the specified stopEvent
 * does not occur (stopEvent is typically 'mouseup' or 'keyup').
 *
 * This is used with the previous/next step buttons and left/right arrow keys,
 * to pause and then repeatedly call previousStep()/nextStep() and drawGrid(),
 * but accepts any button and any functions.
 * (More generally, the "button" could be any arbitrary element, with a handler
 * which calls this in the case of any arbitrary event.)
 */
export function clickAndHold(button, runOnceFunctions, repeatedFunctions, stopEvent) {
  // Call each of the "run once" functions immediately, in given order.
  for (let func of runOnceFunctions) {
    func();
  }

  // Initialize variables for the time delay between each repeat() call.
  let holdDelay = 500;  // Initial hold delay (in milliseconds).
  const minDelay = 50;  // Minimum hold delay (in milliseconds).

  let timeoutID; // ID of the timer that will be set by setTimeout in repeat().

  function repeat() {
    // Call each of the repeated functions, in given order.
    for (let func of repeatedFunctions) {
      func();
    }

    // Set a delayed call to repeat(), with the current holdDelay.
    timeoutID = setTimeout(repeat, holdDelay);

    /* Then calculate the next setTimeout delay.
     * The next delay is halfway between current delay and minimum delay.
     * This converges asymptotically on the minimum delay, so the user will
     * feel like it "speeds up" as they hold the button.
     */
    // holdDelay = ((holdDelay + minDelay) / 2);
    // TODO: Actually it feels more snappy to just immediately go fast after
    // holding down for the initial delay.
    holdDelay = minDelay;
  }

  // When the stopEvent occurs, clears the repeat() function that was queued by
  // setTimeout.
  //
  // We only need to clear the most-recent timeout to stop the loop, because
  // each setTimeout call is "chained": it only calls the next setTimeout when
  // the currently-queued one executes, So at any given moment there is only
  // one setTimeout call queued.
  button.addEventListener(stopEvent, () => clearTimeout(timeoutID), {once: true});

  repeat(); // Call repeat() for the first time, to begin the loop.
}