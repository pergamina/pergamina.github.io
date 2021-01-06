
const AFTER_WORD_DELAY = 300;

function buildTree(flag, text, i, j) {
  if (i + 1 == j) {
    return new Text(Math.random() < 0.9, text[i]);
  }
  let sep = Math.floor(Math.random() * 3) + 2;
  for (let t = sep; t >= 2; t--) {
    let ps = [];
    for (let x = 0; x <= t; x++) {
      ps.push(Math.floor(i + x * (j - i) / t));
    }
    let ok = true;
    for (let x = 0; x < t; x++) {
      if (ps[x] >= ps[x + 1]) {
        ok = false;
      }
    }
    if (!ok) continue;
    let lst = [];
    for (let x = 0; x < t; x++) {
      lst.push(buildTree(!flag, text, ps[x], ps[x + 1]));
    }
    return new Pack(flag, lst);
  }
}

class Verse {
  constructor(verse, cont) {
    this._verse = verse;
    this._cont = cont;
  }

  putOn(poem, verseI, elem) {
    let text = this._verse.split(' ');
    let tree = buildTree(true, text, 0, text.length);
    clearElem(elem);
    return tree.putOn(poem, verseI, elem, 0);
  }
}

class Pack {
  constructor(flag, subelems) {
    this._flag = flag;
    this._subelems = subelems;
  }

  putOn(poem, verseI, elem, index) {
    let div = DIV(this._flag ? 'vert' : 'horiz', []);
    elem.appendChild(div);
    for (let sub of this._subelems) {
      index = sub.putOn(poem, verseI, div, index);
    }
    return index;
  }
}

function clean(msg) {
  return msg.substring(1, msg.length - 1).replace(/_/g, ' ');
}

class Text {
  constructor(border, msg) {
    this._border = border;
    this._msg = msg;
  }

  putOn(poem, verseI, elem, index) {
    if (this._msg[0] == '(') {
      let action = function () {
        write(poem, (verseI + 1) % VERSES[poem].length);
      };
      let div = DIV('text button', [
        P1(A_onclick(TEXT(clean(this._msg)), action))
      ]);
      div.onclick = action;
      div.id = 'txt' + index;
      div._msg = this._msg;
      elem.appendChild(div);
      elem.style.visibility = 'hidden';
      return index + 1;
    } else {
      let div = DIV('text' + (this._border ? ' border' : ''), [
        P1(TEXT(this._msg))
      ]);
      div.id = 'txt' + index;
      div._msg = this._msg;
      elem.appendChild(div);
      elem.style.visibility = 'hidden';
      return index + 1;
    }
  }
}

function writeVerse(i, n) {
  if (i == n) {
    return;
  }
  let elem = _('txt' + i);
  elem.style.visibility = 'visible';
  setTimeout(function () {
    writeVerse(i + 1, n);
  }, AFTER_WORD_DELAY);
}

function write(poem, verseI) {
  let body = _("body");
  let n = VERSES[poem][verseI].putOn(poem, verseI, body);
  writeVerse(0, n, function () {
    console.log('fin');
  });
}

function displayMenu() {
  let menu = _("menu");
  clearElem(menu);
  let buttons = []
  for (let i in VERSES) {
    let button = DIV('button', [TEXT(i)]);
    menu.appendChild(button);
    button.onclick = function () {
      for (let other of buttons) {
        other.classList.remove('selected');
      }
      button.classList.add('visited');
      button.classList.add('selected');
      write(i, 0);
    };
    buttons.push(button);
  }
}

function main() {
  displayMenu();
}

