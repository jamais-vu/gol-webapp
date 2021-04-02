/* jshint esversion: 6 */

import { presetPatterns } from './patterns.js';

/* Functions for modifying HTML elements.
 *
 * These populate HTML elements with initial values related to the grid and
 * canvas, and for update those values as they change.
 */

// TODO: We're leaving this here because eventually I want a `Drawing` class
// which contains all the variables related to drawing, in which case we could
// import only this function, and pass it a `Drawing` instance, and then it
// gets all the arguments for the other functions.
/* Sets initial values of HTML elements on page load. */
function initializeHTMLElements() { // TODO: add export when this is working
  updateStepDelaySliderText(delay); // Show initial delay between grid steps.
  populateSelectPattern();     // Populate preset patterns dropdown menu.
  populateDebugInfoTable(xMax, yMax, rows, columns, cellSize);
  windowSizeCheck(width, height); // Check whether user's browser is a good size
}

/* Populates child elements of the `debugInfoTable` element
 *
 * Unlike the mouse position, which is updated upon mouse move, the values here
 * are determined when the page is first loaded, and do not change thereafter.
 */
export function populateDebugInfoTable(xMax, yMax, rows, columns, cellSize) {
  // xy-coordinates, in pixels, of the bottom-right.
  document.getElementById('canvasDimensions').innerHTML = `${xMax}, ${yMax}`;
  // Count of rows and columns in the grid.
  document.getElementById('gridDimensions').innerHTML = `${rows}, ${columns}`;
  // Size, in pixels, of each cell.
  document.getElementById('cellSize').innerHTML = `${cellSize}x${cellSize} px`;
  // Count of total number of cells in the grid.
  document.getElementById('cellCount').innerHTML = `${rows * columns}`;
  // xy size, in pixels, of the browser window.
  document.getElementById('windowDimensions')
    .innerHTML = `${window.innerWidth}, ${window.innerHeight}`;
}

/* Populates dropdown menu with preset patterns. */
export function populateSelectPattern() {
  let selectPattern = document.getElementById("selectPattern");

  const patternNames = Object.keys(presetPatterns);
  for (let name of patternNames) {
    selectPattern.innerHTML += `<option value="${name}">${name}</option>`;
  }
}

// TODO
/* Shows the xy and ij position of the mouse as it moves on the canvas.
 *
 * This information is displayed in the `debugInfoTable` element.
 */
export function updateCanvasMouseCoords(event) {
  // const mouseCell = getCellFromCoords(event.offsetX, event.offsetY);
  document.getElementById('canvasMouseCoords')
    .innerHTML = `${event.offsetX}, ${event.offsetY}`;
  // document.getElementById('canvasMouseCell')
  //   .innerHTML = `${mouseCell[0]}, ${mouseCell[1]}`;
}

/* Updates the stepCountText HTML element to show current step count. */
export function updateStepCountText(stepCount) {
  document.getElementById('stepCountText').innerHTML = `${stepCount}`;
}

/* Updates the stepDelaySliderText HTML element to show current delay. */
export function updateStepDelaySliderText(delay) {
  document.getElementById('stepDelaySliderText').innerHTML = `${delay} ms`;
}

/* Shows the xy position of the mouse as it moves in the window.
 *
 * This information is displayed in the `debugInfoTable` element.
 */
export function updateWindowMouseCoords(event) {
  document.getElementById('windowMouseCoords')
    .innerHTML = `${event.clientX}, ${event.clientY}`;
}

/* If the window is not wide or tall enough, suggest the user resize it. */
export function windowSizeCheck(width, height) {
if (width < 700 || height < 600) {
  document.getElementById('windowSizeAlert')
    .innerHTML = '(Best viewed in a larger window! <a href="">Reload</a>' +
                 ' the page after resizing.)';
  }
}
