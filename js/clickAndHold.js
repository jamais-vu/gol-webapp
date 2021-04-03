/* jshint esversion: 6 */

/* This module contains the function `clickAndHold`.
 *
 * It also contains the unused stub `calculateNextDelay` for future expansion.
 * I put this in its own module due to its complexity and its generality.
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
export function clickAndHold(button, runOnceFunctions, repeatedFunctions, stopEvent, initialDelay = 500, minDelay = 50) {
  /* Call each of the "run once" functions immediately, in given order. */
  for (let func of runOnceFunctions) {
    func();
  }

  let holdDelay = initialDelay; // Delay (in ms) between repeats
  let timeoutID; // ID of the timer that will be set by setTimeout in repeat().

  function repeat() {
    /* Call each of the repeated functions, in given order. */
    for (let func of repeatedFunctions) {
      func();
    }

    /* Set a delayed call to repeat(), with the current holdDelay. */
    timeoutID = setTimeout(repeat, holdDelay);

    holdDelay = minDelay; // See calculateNextDelay below for potential features
  }

  /* On stopEvent, clears the repeat() function that was queued by setTimeout.
   *
   * We only need to clear the most-recent timeout to stop the loop, because
   * each setTimeout call is "chained": it only calls the next setTimeout when
   * the currently-queued one executes, So at any given moment there is only
   * one setTimeout call queued. */
  button.addEventListener(stopEvent, () => clearTimeout(timeoutID), {once: true});

  repeat(); // Call repeat() for the first time, to begin the loop.
}

/* Helper function for arbitrary delay sequences.
 *
 * NOTE: This is not used, but I include it because it's interesting and could
 * be useful if we use this module in other projects.
 *
 * In the clickAndHold function above, we simply set holdDelay to minDelay
 * immediately, since that feels "snappiest" for the user, but we could set
 * each subsequent delay using any rule we want, by replacing the line
 *     `holdDelay = minDelay`
 * with
 *     `holdDelay = calculateNextDelay(holdDelay, minDelay)`.
 *
 * For example, we could have the difference between the currentDelay and the
 * minDelay decrease exponentially, for the repeating to start slowly and then
 * speed up as it approaches a horizontal asymptote at minDelay.
 *
 * (Could also replace that line with a generator and call next on it.)
 */
function calculateNextDelay(currentDelay, minDelay) {
  let nextDelay;
  // Code with Whatever logic you want to use to scale the delays.
  return nextDelay;
}