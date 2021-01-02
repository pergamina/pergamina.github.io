
const AFTER_LETTER_DELAY = 50;
const AFTER_VERSE_DELAY = 300;
const AFTER_STANZA_DELAY = 1000;

class Writer {

  start() {
    this._parts = PARTS;
    this.displayMenu(true);
    this._current = null;
    this._status = [];
    this._frames = [];
    this._texts = [];
    this._canvases = [];
    let body = _('body');
    for (let part of this._parts) {
      this._status.push(0);
      let text = DIV('text', []);
      let canvas = DIV('canvas', []);
      let frame = DIV('frame', [H1(TEXT(part[0])), text, canvas]);
      frame.style.display = 'none';
      body.appendChild(frame);
      this._frames.push(frame);
      this._texts.push(text);
      this._canvases.push(canvas);
    }
  }

  displayMenu(enabled) {
    let self = this;
    let menu = _('menu');
    clearElem(menu);
    let i = -1;
    for (let part of this._parts) {
      i += 1;
      let ii = i;
      let j = ii.toString();
      let title = j + j + j + j;
      if (i === this._current) {
        title = '[' + title + ']';
      }
      if (enabled) {
        menu.appendChild(A_onclick(TEXT(title), function () {
          self._current = ii;
          self.displayCurrentFrame();
          self.startWriting();
          document.body.className = 'col' + j;
        }));
      } else {
        menu.appendChild(TEXT(title));
      }
      menu.appendChild(TEXT(' '));
    }
  }

  displayCurrentFrame() {
    for (let frame of this._frames) {
      frame.style.display = 'none';
    }
    this._frames[this._current].style.display = '';
  }

  startWriting() {
    let i = this._current;
    clearElem(this._texts[i]);
    this.write();
  }

  write() {
    let i = this._current;
    let j = this._status[i];
    let verses = this._parts[i][1];
    if (j >= verses.length) {
      this._status[i] = 0;
      this.displayMenu(true);
    } else {
      this.displayMenu(false);
      let verse = verses[j];
      let elem = this._texts[i];
      let textElem = TEXT('');
      elem.insertBefore(P1(textElem), elem.firstChild);
      this.writeVerse(textElem, 0);
    }
  }

  writeVerse(textElem, k) {
    let self = this;
    let i = this._current;
    let j = this._status[i];
    let verse = this._parts[i][1][j];

    let fragment = verse.substr(0, k);
    textElem.textContent = fragment;
    evalCmd(verse, fragment, this._canvases[i]);
    if (verse.length === 0) {
      setTimeout(function () {
        let elem = self._texts[i];
        elem.insertBefore(BR(), elem.firstChild);
        self._status[i] += 1;
        self.write();
      }, AFTER_STANZA_DELAY);
    } else if (k === verse.length) {
      setTimeout(function () {
        self._status[i] += 1;
        self.write();
      }, AFTER_VERSE_DELAY);
    } else { 
      setTimeout(function () {
        self.writeVerse(textElem, k + 1);
      }, AFTER_LETTER_DELAY);
    }
  }

}

let WRITER = null;

function main() {
  WRITER = new Writer();
  WRITER.start();
}

