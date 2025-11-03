// Hint logic: Using a hint leaves only one remaining guess
export class HintManager{
  constructor(state){
    this.state = state; // { usedHint: bool, guessesRemaining: number, answer: string }
  }

  applyOneLetterReveal(gridTiles){
    if(this.state.usedHint) return;
    this.state.usedHint = true;

    // Reveal one correct letter position in the first empty row
    const idxs = [...this.state.answer].map((ch,i)=>i);
    const revealIndex = idxs[Math.floor(Math.random()*idxs.length)];
    const letter = this.state.answer[revealIndex];

    // Put the revealed letter into the next empty row's tile (visually)
    const row = this.state.currentRow;
    const col = revealIndex;
    const tile = gridTiles[row * this.state.cols + col];
    if(tile){
      tile.textContent = letter.toUpperCase();
      tile.dataset.prefilled = "1";
      tile.style.outline = "2px dashed #f4b400";
    }

    // Enforce rule: only ONE guess remains after using a hint
    if(this.state.guessesRemaining > 1){
      this.state.guessesRemaining = 1;
    }
  }
}
