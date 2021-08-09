
/* User interface */

class EmojiTable {

  constructor() {
    this._tableWidth = 30; // #emojis per row
    this._tableHeight = 24; // #emojis per col
    this._emojiWidth = 39.93; // emoji width per px
    this._emojiHeight = 39.93; // emoji height per px
  }

  numEmojis() {
    return this._tableWidth * this._tableHeight;
  }

  emojiWidth() {
    return this._emojiWidth;
  }

  emojiHeight() {
    return this._emojiHeight;
  }

  _emojiDeltaX(i) {
    return (i % this._tableWidth) * this._emojiWidth;
  }

  _emojiDeltaY(i) {
    return Math.floor(i / this._tableWidth) * this._emojiHeight;
  }

  emojiPosition(i) {
    return '-' + this._emojiDeltaX(i) + 'px -' + this._emojiDeltaY(i) + 'px';
  }
}

const EMPTY = -1;

class GUI {

  constructor(controlElem, emojiSelectorElem, poemElem) {
    // Haiku generator
    this._haikuGenerator = new HaikuGenerator();
    // Emoji selector
    this._emojiSelectorWidth = 14; // #emojis per row (per tab)
    this._emojiSelectorHeight = 8; // #emojis per col (per tab)
    this._emojiSelectorElem = emojiSelectorElem;
    this._emojiTable = new EmojiTable();
    this._currentEmoji = 0;
    // Control
    this._controlWidth = 7;
    this._controlHeight = 5;
    this._controlElem = controlElem;
    this._matrix = [[]];
    // Poem
    this._poemElem = poemElem;
  }

  start() {
    this._createEmojiSelector(/*currentTab*/0);
    this._createControl();
  }

  _createEmojiSelector(currentTab) {
    let self = this;

    clearElem(this._emojiSelectorElem);
    let width = this._emojiSelectorWidth;
    let height = this._emojiSelectorHeight;
    let numEmojisPerTab = width * height;
    let numTabs = Math.floor(this._emojiTable.numEmojis() / numEmojisPerTab);

    // Tab selector buttons
    let buttons = document.createElement('div');
    for (let i = 0; i < numTabs; i++) {
      let btn = BUTTON(i, function () {
        self._createEmojiSelector(i);
      });
      btn.className = 'tab-button';
      if (i === currentTab) {
        btn.classList.add('selected');
      }
      buttons.appendChild(btn);
    }
    this._emojiSelectorElem.appendChild(buttons);

    let allCells = [];

    function selectEmoji(cellElem) {
      for (let c of allCells) {
        c.classList.remove('selected');
      }
      cellElem.classList.add('selected');
      self._currentEmoji = cellElem.emojiNum;
    }

    // Emoji selector buttons
    let table = document.createElement('table');
    let n = currentTab * numEmojisPerTab;
    for (let i = 0; i < height; i++) {
      let row = document.createElement('tr');
      for (let j = 0; j < width; j++) {
        let cell = document.createElement('td');
        allCells.push(cell);
        cell.className = 'emoji-cell';
        cell.style.width = this._emojiTable.emojiWidth() + 'px';
        cell.style.height = this._emojiTable.emojiHeight() + 'px';
        cell.style.backgroundImage = 'url("emoji.png")';
        cell.style.backgroundPosition = this._emojiPosition(n);
        cell.emojiNum = n;
        cell.onclick = function () {
          selectEmoji(cell);
        };
        // begin debug
        cell.onmouseover = function () {
          let numElem = document.getElementById('number');
          clearElem(numElem);
          numElem.appendChild(TEXT(cell.emojiNum));
        };
        // end debug
        row.appendChild(cell);
        n += 1;
      }
      table.appendChild(row);
    }
    selectEmoji(allCells[0]);
    this._emojiSelectorElem.appendChild(table);
  }

  _createControl() {
    let self = this;

    let width = this._controlWidth;
    let height = this._controlHeight;

    // Initialize matrix
    this._matrix = [];
    for (let i = 0; i < height; i++) {
      let mrow = [];
      for (let j = 0; j < width; j++) {
        mrow.push(EMPTY);
      }
      this._matrix.push(mrow);
    }

    // Create matrix controller
    let table = document.createElement('table');
    for (let i = 0; i < height; i++) {
      let row = document.createElement('tr');
      for (let j = 0; j < width; j++) {
        let cell = document.createElement('td');
        cell.className = 'control-cell';
        cell.style.width = this._emojiTable.emojiWidth() + 'px';
        cell.style.height = this._emojiTable.emojiHeight() + 'px';
        row.appendChild(cell);
        cell.onmouseover = function () {
          if (self._matrix[i][j] === EMPTY) {
            self._setCellImagePreview(cell, self._currentEmoji);
          } else {
            self._setCellImagePreview(cell, self._matrix[i][j]);
          }
        };
        cell.onclick = function () {
          if (self._matrix[i][j] === EMPTY) {
            self._putMatrix(i, j, self._currentEmoji);
            self._setCellImage(cell, self._currentEmoji);
          } else if (self._matrix[i][j] === self._currentEmoji) {
            self._putMatrix(i, j, EMPTY);
            self._clearCellImage(cell);
          } else {
            self._putMatrix(i, j, EMPTY);
            self._setCellImagePreview(cell, self._currentEmoji);
          }
        };
        cell.onmouseout = function () {
          if (self._matrix[i][j] === EMPTY) {
            self._clearCellImage(cell);
          } else {
            self._setCellImage(cell, self._matrix[i][j]);
          }
        };
      }
      table.appendChild(row);
    }
    this._controlElem.appendChild(table);
  }

  _putMatrix(i, j, n) {
    this._matrix[i][j] = n;
    this._generatePoem();
  }

  _clearCellImage(cell) {
    cell.style.backgroundImage = '';
    cell.style.backgroundPosition = '';
    cell.style.opacity = 1;
  }

  _setCellImagePreview(cell, n) {
    cell.style.backgroundImage = 'url("emoji.png")';
    cell.style.backgroundPosition = this._emojiPosition(n);
    cell.style.opacity = 0.5;
  }

  _setCellImage(cell, n) {
    cell.style.backgroundImage = 'url("emoji.png")';
    cell.style.backgroundPosition = this._emojiPosition(n);
    cell.style.opacity = 1;
  }

  _emojiPosition(n) {
    return this._emojiTable.emojiPosition(n);
  }

  _generatePoem() {
    clearElem(this._poemElem);
    let poem = this._haikuGenerator.generate(this._matrix);
    for (let line of poem) {
      this._poemElem.appendChild(TEXT(line));
      this._poemElem.appendChild(BR());
    }
  }

}

function main() {
  let controlElem = document.getElementById('control');
  let emojiSelectorElem = document.getElementById('emoji');
  let poemElem = document.getElementById('poem');
  let gui = new GUI(control, emoji, poem);
  gui.start();
}

