// Grid module: initializes a fixed 5x6 board and prevents 1-col collapse
export const GRID_COLS = 5;
export const GRID_ROWS = 6;

export function buildGrid(rootEl){
  rootEl.innerHTML = "";
  rootEl.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`; // harden columns
  const tiles = [];
  for(let r=0;r<GRID_ROWS;r++){
    for(let c=0;c<GRID_COLS;c++){
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('data-row', r);
      tile.setAttribute('data-col', c);
      tile.textContent = '';
      rootEl.appendChild(tile);
      tiles.push(tile);
    }
  }
  return tiles;
}
