
let STATE = [];

function symbol(word) {
  return word == '.'
      || word == ':'
      || word == ','
      || word == "'"
      || word == '?';
}

function rr(n) {
  return Math.floor(Math.random() * n);
}

function rc(list) {
  return list[rr(list.length)];
}

function buildTranslationTable() {
  let table = {};
  let forbidden = {};

  let diafactor = 1 + rr(10);

  let vowels = ['aeiou', 'áéíóú', 'àèìòù', 'âêîôû', 'äëïöü'];
  let avowels = [];
  let nvowels = 0;
  let dvowels = {};
  for (let i = 0; i < vowels.length; i++) {
    if (i == 0 || Math.random() <= 0.5 / (diafactor * (1 + nvowels))) {
      nvowels += 1;
      for (let j = 0; j < vowels[i].length; j++) {
        if (Math.random() <= 0.75) {
          for (let k = 0; k < rr(100); k++) {
            let v = vowels[i][j];
            avowels.push(v);
            if (v in dvowels) {
              dvowels[v] += 1;
            } else {
              dvowels[v] = 0;
            }
          }
        }
      }
    }
  }
  if (avowels.length == 0) {
    avowels = vowels[0];
  }

  let dipfactor = 1 + rr(10);
  for (let v in dvowels) {
    for (let w in dvowels) {
      if (v == w) { continue; }
      for (let i = 0; i < rr(rr(dvowels[v] * dvowels[w])) / dipfactor; i++) {
        avowels.push(v + w)
      }
    }
  }

  let consonants = ['bcdfghjklmnpqrstvwxyz', 'ćǵj́ḱĺḿṕŕśẃýź',
                    'm̀ǹ', 'ĉĝĥĵŝŵŷẑ',
                    ['bh', 'ch', 'dh', 'gh', 'kh', 'ph',
                     'rh', 'sh', 'th', 'xh', 'zh']];
  let aconsonants = [];
  let nconsonants = 0;
  let dconsonants = {};
  for (let i = 0; i < consonants.length; i++) {
    if (i == 0 || Math.random() <= 1 / (diafactor * (1 + nconsonants))) {
      nconsonants += 1;
      for (let j = 0; j < consonants[i].length; j++) {
        if (Math.random() <= 0.75) {
          for (let k = 0; k < rr(100); k++) {
            let c = consonants[i][j];
            aconsonants.push(c);
            if (c in dconsonants) {
              dconsonants[c] += 1;
            } else {
              dconsonants[c] = 0;
            }
          }
        }
      }
    }
  }
  if (aconsonants.length == 0) {
    aconsonants = consonants[0];
  }

  let liquids = 'lrhwy';

  let clufactor = 1 + rr(2);
  let aclusters = []
  for (let c in dconsonants) {
    for (let l of liquids) {
      let r = rr(dconsonants[c] * dconsonants[l]) / clufactor;
      for (let i = 0; i < r; i++) {
        aclusters.push(c + l);
      }
    }
  }
  if (aclusters.length == 0) {
    aclusters = aconsonants;
  }

  let phonotactics = [
    'cv', 'cv', 'cv', 'cv', 'Cv', 'Cv', 'cvc',
    'vc', 'vc', 'vc', 'vc', 
    'cv', 'cv', 'cv', 'cv', 'Cv', 'Cv', 'cvc',
    'vc', 'vc', 'vc', 'vc', 
    'cv', 'cv', 'cv', 'cv', 'Cv', 'Cv', 'cvc',
    'vc', 'vc', 'vc', 'vc', 
    'cvcv', 'cvcv', 'cvCv', 'Cvcv'
  ];
  let aphonotactics = [];
  for (let i = 0; i < phonotactics.length; i++) {
    for (let j = 0; j < rr(100); j++) {
      aphonotactics.push(phonotactics[i]);
    }
  }
 
  function gen1() {
    let form = rc(aphonotactics);
    let s = '';
    for (let part of form) {
      if (part == 'c') {
        s += rc(aconsonants);
      } else if (part == 'C') {
        s += rc(aclusters);
      } else if (part == 'v') {
        s += rc(avowels);
      }
    }
    return s;
  }

  function gen() {
    let g = gen1();
    while (g in forbidden) {
      g = gen1();
    }
    forbidden[g] = true;
    return g;
  }

  for (let i = 0; i < TVERSES.length; i++) {
    for (let line of TVERSES[i]) {
      for (let word of line) {
        if (!symbol(word)) {
          for (let syl of word) {
            if (!(syl in table)) {
              table[syl] = gen();
            }
          }
        }
      }
    }
  }
  return table;
}

function capitalize(word) {
  return word.replace(
           /([^\s:\-])([^\s:\-]*)/g,
           function(_, a, b) {
             return a.toUpperCase() + b.toLowerCase();
           }
         );
}

function main() {
  let menu = _('menu');
  let menuButtons = [];
  let translateButton = BUTTON('Traducir', function () {});
  let translationTable = buildTranslationTable();

  function put_tpoem(i) {
    let tpoem = _('tpoem');
    let upper = true;
    for (let line of TVERSES[i]) {
      let str = '';
      let first = true;
      for (let word of line) {
        if (symbol(word)) {
          str += word;
          upper = (word == '.' || word == '?');
        } else {
          if (first) {
            first = false;
          } else {
            str += ' ';
          }
          for (let syl of word) {
            str += upper ? capitalize(translationTable[syl])
                         : translationTable[syl];
            upper = false;
          }
        }
      }
      tpoem.appendChild(TEXT(str));
      tpoem.appendChild(BR());
    }
  }

  function put_poem(i) {
    let poem = _('poem');
    for (let line of VERSES[i]) {
      poem.appendChild(TEXT(line));
      poem.appendChild(BR());
    }
  }

  function select(i) {
    for (let j = 0; j < VERSES.length; j++) {
      menuButtons[j].className = '';
    }
    menuButtons[i].className = 'selected';
    let poems = _('poems');
    let tpoem = _('tpoem');
    let poem = _('poem');
    poems.style.visibility = 'visible';
    clearElem(tpoem);
    clearElem(poem);
    put_tpoem(i);
    translateButton.onclick = function () {
      put_poem(i);
    };
    translateButton.style.visibility = 'visible';
  }

  for (let i = 0; i < VERSES.length; i++) {
    STATE.push(0);
  }
  for (let i = 0; i < VERSES.length; i++) {
    let btn = BUTTON(i, function () {
      select(i);
    });
    menuButtons.push(btn);
    menu.append(btn);
  }
  translateButton.className = 'translate';
  translateButton.style.visibility = 'hidden';
  menu.append(translateButton);
}

