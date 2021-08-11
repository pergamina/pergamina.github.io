
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

  constructor(controlElem, emojiSelectorElem, poemElem, clearBtn, shareBtn) {
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
    this._matrixCells = [];
    // Poem
    this._poemElem = poemElem;
    this._poemText = [];
    this._controlCells = [];

    let self = this;

    // Clear button
    clearBtn.onclick = function () {
      self._clear();
    };

    // Share button
    shareBtn.onclick = function () {
      self._share();
    };
  }

  start() {
    this._createControlCells();
    this._createEmojiSelector(/*currentTab*/0);
    this._createControl();
  }

  _unselectEmoji() {
    for (let c of this._controlCells) {
      c.classList.remove('selected');
    }
    this._currentEmoji = EMPTY;
    this._controlElem.classList.remove('emoji-selected');
  }

  _selectEmoji(cellElem) {
    for (let c of this._controlCells) {
      c.classList.remove('selected');
    }
    cellElem.classList.add('selected');
    this._currentEmoji = cellElem.emojiNum;
    this._controlElem.classList.add('emoji-selected');
  }

  _createControlCells() {
    let self = this;
    for (let n = 0; n < this._emojiTable.numEmojis(); n++) {
      let cell = document.createElement('td');
      this._controlCells.push(cell);
      cell.className = 'emoji-cell';
      cell.style.width = this._emojiTable.emojiWidth() + 'px';
      cell.style.height = this._emojiTable.emojiHeight() + 'px';
      cell.emojiNum = n;
      cell.onclick = function () {
        if (cell.enabled) {
          self._selectEmoji(cell);
        }
      };
      cell.disable = function () {
        cell.enabled = false;
        cell.style.backgroundImage = '';
        cell.classList.remove('enabled');
      };
      cell.enable = function () {
        cell.enabled = true;
        cell.style.backgroundImage = 'url("emoji.png")';
        cell.style.backgroundPosition = self._emojiPosition(n);
        cell.classList.add('enabled');
      };
      cell.enable();
    }
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

    // Emoji selector buttons
    let table = document.createElement('table');
    let n = currentTab * numEmojisPerTab;
    for (let i = 0; i < height; i++) {
      let row = document.createElement('tr');
      for (let j = 0; j < width; j++) {
        row.appendChild(this._controlCells[n]);
        n += 1;
      }
      table.appendChild(row);
    }
    self._unselectEmoji();
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

    // Initialize matrix cells
    this._matrixCells = [];
    for (let i = 0; i < height; i++) {
      let mrow = [];
      for (let j = 0; j < width; j++) {
        mrow.push(null);
      }
      this._matrixCells.push(mrow);
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
        cell.onclick = function () {
          if (self._matrix[i][j] === EMPTY && self._currentEmoji !== EMPTY) {
            cell.classList.add('full');
            self._controlCells[self._currentEmoji].disable();
            self._putMatrix(i, j, self._currentEmoji);
            self._setCellImage(cell, self._currentEmoji);
            self._unselectEmoji();
          } else if (self._matrix[i][j] !== EMPTY) {
            cell.classList.remove('full');
            self._controlCells[self._matrix[i][j]].enable();
            self._putMatrix(i, j, EMPTY);
            self._clearCellImage(cell);
          }
        };
        this._matrixCells[i][j] = cell;
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

  _setCellImage(cell, n) {
    cell.style.backgroundImage = 'url("emoji.png")';
    cell.style.backgroundPosition = this._emojiPosition(n);
    cell.style.opacity = 1;
  }

  _emojiPosition(n) {
    return this._emojiTable.emojiPosition(n);
  }

  async _generatePoem() {
    let self = this;
    function show_progress(text) {
      clearElem(self._poemElem);
      self._poemElem.appendChild(TEXT(text));
      self._poemElem.appendChild(BR());
    }
    let poem = await this._haikuGenerator.generate(
                 show_progress,
                 this._matrix
               );
    this._writePoem(poem);
  }

  _writePoem(poem) {
    this._poemText = poem;
    clearElem(this._poemElem);
    for (let line of poem) {
      this._poemElem.appendChild(TEXT(line));
      this._poemElem.appendChild(BR());
    }
  }

  _clear() {
    this._poemText = [];
    clearElem(this._poemElem);
    let n = this._matrix.length;
    let m = this._matrix[0].length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (this._matrix[i][j] !== EMPTY) {
          let cell = this._matrixCells[i][j];
          cell.classList.remove('full');
          this._controlCells[this._matrix[i][j]].enable();
          this._putMatrix(i, j, EMPTY);
          this._clearCellImage(cell);
        }
      }
    }
  }

  _saveState() {
    return btoa(JSON.stringify([
             this._matrix,
             this._poemText,
           ]));
  }

  loadState(string) {
    if (!string.startsWith('h=')) {
      return;
    }
    let [matrix, poem] = JSON.parse(atob(string.substring(2, string.length)));
    this._writePoem(poem);
    this._unselectEmoji();
    let n = matrix.length;
    let m = matrix[0].length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let cell = this._matrixCells[i][j];
        let emoji = matrix[i][j];
        this._matrix[i][j] = emoji;
        if (emoji === EMPTY) {
          cell.classList.remove('full');
          this._clearCellImage(cell);
        } else {
          this._matrix[i][j] = emoji;
          cell.classList.add('full');
          this._controlCells[emoji].disable();
          this._setCellImage(cell, emoji);
        }
      }
    }
  }

  _share() {
    let state = this._saveState();
    let share_url = window.location.href.split('?')[0] + '?h=' + state;
    // Share screen
    let shareBox = document.createElement('div');
    shareBox.className = 'shareBox';
    let text = document.createElement('input');
    text.type = 'text';
    text.value = share_url;
    text.readOnly = true;
    shareBox.appendChild(text);
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'cerrar';
    shareBox.appendChild(btn);
    document.body.appendChild(shareBox);
    text.select();
    btn.onclick = function () {
      document.body.removeChild(shareBox);
    };
  }

}

function main() {
  let controlElem = document.getElementById('control');
  let emojiSelectorElem = document.getElementById('emoji');
  let poemElem = document.getElementById('poem');
  let clearBtn = document.getElementById('clear_btn');
  let shareBtn = document.getElementById('share_btn');
  let gui = new GUI(control, emoji, poem, clearBtn, shareBtn);
  gui.start();
  let url = window.location.href.split('?');
  if (url.length > 0) {
    gui.loadState(url[1]);
  }
}

