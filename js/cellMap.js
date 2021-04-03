/* jshint esversion: 6 */

/* Wrapper object for a map of ij coords (as strings 'i,j') to cell state.
 *
 * This object is used in `holdDraw()`, to store which cells of the grid the
 * mouse has already "visited" while the mouse button is held down.
 */
export class cellMap  {

  constructor() {
    /* Map of string `${i},${j}` to state of cell ij. */
    this.cells = new Map();
  }

  /* Store value with key ij. */
  set(i, j, value) {
    this.cells.set(`${i},${j}`, value);
  }

  /* Check whether key ij is in the Map. */
  has(i, j) {
    return this.cells.has(`${i},${j}`);
  }

  /* Get the value corresponding to key ij. */
  get(i, j) {
    return this.cells.get(`${i},${j}`);
  }

  /* Clear all key-value mappings. (Equivalent to using new class instance). */
  clear() {
    this.cells.clear();
  }
}