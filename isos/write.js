
let RNG = new RandomNumberGenerator();
let SEED = Math.floor(Math.random() * 0xfffffff);

function randrange(n) {
  return Math.floor(Math.random() * n);
}

function shuffle(list) {
  let list_copy = [...list];
  let n = list.length;
  let res = [];
  for (let i = 0; i < n; i++) {
    let j = randrange(list_copy.length);
    res.push(list_copy[j]);
    list_copy[j] = list_copy[0];
    list_copy.shift();
  }
  return res;
}

function slide_select_poem() {
  RNG.randomize(SEED);
  let index = _('slide_poem').value;
  if (index % 10 === 0) {
    let i = Math.floor(index / 10);
    let poem = [];
    for (let verse of VERSES[i]) {
      poem.push(verse);
    }
    return poem;
  }
  let p = 1 - (index % 10) / 10;
  let i = Math.floor(index / 10);
  let j = (i + 1) % VERSES.length;
  let poem1 = VERSES[i];
  let poem2 = VERSES[j];
  let target_length = Math.floor(poem1.length * p + poem2.length * (1 - p));
  let poem = [];
  for (let k = 0; k < target_length; k++) {
    let source = (RNG.rnd() < p) ? poem1 : poem2;
    let ii = Math.floor(k / target_length * source.length);
    poem.push(source[ii]);
  }
  return poem;
}

function character_ruiner(slider_name, ruin) {
  function f(poem) {
    let p = _(slider_name).value / 100;
    let poem2 = [];
    let ii = 0;
    for (let verse of poem) {
      RNG.randomize(SEED + ii);
      ii += 1;
      let verse2 = '';
      for (let c of verse) {
        let c2 = ruin(c);
        if (RNG.rnd() > p) {
          c = c2;
        }
        verse2 += c;
      }
      poem2.push(verse2);
    }
    return poem2;
  }
  return f;
}

function is_punctuation(c) {
  return c == '.' || c == ',' || c == ';' || c == ':' || c == '('
      || c == ')' || c == '¡' || c == '!' || c == '¿' || c == '?';
}

function ruin_case(c) {
  if (RNG.rnd() > 0.01) {
    return c.toLowerCase();
  } else {
    return c.toUpperCase();
  }
}

function ruin_punctuation(c) {
  if (is_punctuation(c)) {
    return '_';
  } else {
    return c
  }
}

function ruin_letterform(c) {
  let d = {
    'b': ['v', 'd'],
    'd': ['b'],
    'h': ['_'],
    'j': ['i'],
    's': ['z'],
    'v': ['b', 'u'],
    'z': ['s'],
    'B': ['V'],
    'S': ['Z'],
    'U': ['C', 'V'],
    'V': ['B', 'U'],
    'Z': ['S'],
  };
  if (c in d) {
    return RNG.choice(d[c]); 
  } else {
    return c;
  }
}

function ruin_erase(c) {
  if (c == ' ') {
    return c;
  } else if (RNG.rnd() > 0.5) {
    return '_';
  } else {
    return c;
  }
}

function slide_erase_verses(poem) {
  let p = _('slide_erase_verses').value;
  if (p == 100) {
    return poem;
  }
  p = p / 100;
  RNG.randomize(SEED);
  let poem2 = [];
  for (let verse of poem) {
    if (RNG.rnd() <= p) {
      poem2.push(verse);
    }
  }
  if (poem2.length == 0) {
    poem2 = [RNG.choice(poem)];
  }
  return poem2;
}

function slide_replacements(poem) {

  function replacement_for(word) {
    if (word in REPL_KEYMAP) {
      let key = REPL_KEYMAP[word];
      if (key in REPL_DICT) {
        return RNG.choice(REPL_DICT[key]);
      } else {
        return word;
      }
    } else {
      return word;
    }
  }

  let p = _('slide_replacements_wrap').value;
  if (p == 100) {
    return poem;
  }
  p = p / 100;
  RNG.randomize(SEED);
  let poem2 = [];
  for (let verse of poem) {
    let verse2 = [];
    for (let orig_word of verse.split(' ')) {
      let prefix = ''; 
      let suffix = ''; 
      let word = orig_word;
      if (is_punctuation(word[0])) {
        prefix = word[0];
        word = word.substring(1, word.length);
      }
      if (is_punctuation(word[word.length - 1])) {
        suffix = word[word.length - 1];
        word = word.substring(0, word.length - 1);
      }
      let repl_word = replacement_for(word.toLowerCase());
      if (RNG.rnd() > p) {
        word = prefix + repl_word + suffix;
      } else {
        word = orig_word;
      }
      verse2.push(word);
    }
    poem2.push(verse2.join(' '));
  }
  return poem2;
}

function slide_dispress(poem) {
  let p = _('slide_dispress').value;
  if (p == 100) {
    return poem;
  }
  RNG.randomize(SEED);

  let len = Math.floor(p / 20 + RNG.rnd() * ((p % 20) / 20));
  p = p / 100;

  let text = poem.join(' ');
  let dict = {};
  let prev = '';
  for (let next of text) {
    if (prev.length == len) {
      if (!(prev in dict)) {
        dict[prev] = [];
      }
      dict[prev].push(next);
    }
    prev = prev + next;
    prev = prev.substring(prev.length - len, prev.length);
  }

  let poem2 = [];
  prev = '';
  for (let verse of poem) {
    let verse2 = '';
    for (let i = 0; i < verse.length; i++) {
      if (RNG.rnd() < p) {
        prev = '';
      }
      let next = '';
      if (prev.length < len) {
        next = verse[i];
      } else {
        let prev_suffix = prev.substring(prev.length - len, prev.length);
        if (prev_suffix in dict) {
          next = RNG.choice(dict[prev_suffix]);
        } else {
          next = verse[i];
        }
      }
      prev += next;
      verse2 += next;
    }
    poem2.push(verse2);
  }
  return poem2;
}

function fix_punctuation(poem) {

  function ends_sentence(x) {
    return x == '.' || x == '!' || x == '?';
  }

  function continues_sentence(x) {
    return x == ',' || x == ';' || x == ':';
  }

  function is_upper(x) {
    return x.toUpperCase() == x;
  }

  function capitalize(x) {
    return x[0].toUpperCase() + x.substring(1, x.length);
  }

  function add_period(x) {
    if (ends_sentence(x[x.length - 1])) {
      return x;
    } else if (continues_sentence(x[x.length - 1])) {
      return x.substring(0, x.length - 1) + '.';
    } else {
      return x + '.';
    }
  }

  for (let i = 0; i < poem.length; i++) {
    poem[i] = poem[i].replace(/_/g, '').trim();
  }

  for (let i = 0; i < poem.length; i++) {
    if (i == 0 || (poem[i - 1].length > 0 && ends_sentence(poem[i - 1][poem[i - 1].length - 1]))) {
      poem[i] = capitalize(poem[i]);
    }
    if (i == poem.length - 1 || (poem[i + 1].length > 0 && is_upper(poem[i + 1][0]))) {
      poem[i] = add_period(poem[i]);
    }
  }
  return poem;
}

let slide_case = character_ruiner('slide_case_erase_letters', ruin_case);
let slide_whitespace = character_ruiner('slide_letterform_whitespace', ruin_punctuation);
let slide_erase_letters = character_ruiner('slide_case_erase_letters', ruin_erase);

function slide_letterform(poem) {
  let p = _('slide_letterform_whitespace').value;
  if (p == 100) {
    return poem;
  }
  p = p / 100;
  RNG.randomize(SEED);
  const REPLACEMENTS = [
    {'á': 'A', 'é': 'E', 'í': 'I', 'ó': 'O', 'ú': 'U', 'ñ': 'N', 'ü': '&'},
    // c
    {'ca': 'ka', 'ce': 'se', 'ci': 'si', 'co': 'ko', 'cu': 'ku'},
    {'cA': 'kA', 'cE': 'sE', 'cI': 'sI', 'cO': 'kO', 'cU': 'kU'},
    // ch
    {'cha': 'Ca', 'che': 'Ce', 'chi': 'Ci', 'cho': 'Co', 'chu': 'Cu'},
    {'chA': 'CA', 'chE': 'CE', 'chI': 'CI', 'chO': 'CO', 'chU': 'CU'},
    // c
    {'c': 'k'},
    // g
    {'ge': 'je', 'gi': 'ji'},
    {'gE': 'jE', 'gI': 'jI'},
    {'gue': 'ge', 'guE': 'gE'},
    {'gui': 'gi', 'guI': 'gI'},
    {'g&': 'gu'},
    // h
    {'h': ''},
    // ll
    {'ll': 'y'},
    // m
    {'m ': 'n '},
    // n
    {'nv': 'mb'},
    // q
    {'que': 'ke', 'quE': 'kE'},
    {'qui': 'ki', 'quI': 'kI'},
    {'q': 'k'},
    // r
    {' r': ' R', 'rr': 'R', 'nr': 'nR', 'sr': 'sR', 'lr': 'lR'},
    // sh
    {'sh': 'S'},
    // v
    {'v': 'b'},
    // w
    {'w': 'u'},
    // y
    {'ya': 'Sa', 'ye': 'Se', 'yi': 'Si', 'yo': 'So', 'yu': 'Su'},
    {'yA': 'SA', 'yE': 'SE', 'yI': 'SI', 'yO': 'SO', 'yU': 'SU'},
    {'y': 'i'},
    // x
    {'x': 'ks'},
    // z
    {'z': 's'},
    // mp
    {'mp': 'np', 'mb': 'nb'},
    // ni
    {'nia': 'Na', 'nie': 'Ne', 'nio': 'No', 'niu': 'Nu'},
    {'niA': 'NA', 'niE': 'NE', 'niO': 'NO', 'niU': 'NU'},
    // sc
    {'ss': 's'},
    // ee
    {'ee': 'e'},
  ];
  let replacements = [];
  for (let repl of REPLACEMENTS) {
    if (RNG.rnd() > p) {
      replacements.push(repl);
    }
  }
  let poem2 = [];
  for (let verse of poem) {
    let verse2 = [];
    for (let word of verse.split(' ')) {
      word = ' ' + word.toLowerCase() + ' ';
      for (let replacement of replacements) {
        for (let source in replacement) {
          let target = replacement[source];
          word = replaceAll(word, source, target);
        }
      }
      word = replaceAll(word, 'C', 'ch');
      word = replaceAll(word, 'S', 'sh');
      word = replaceAll(word, 'R', 'rr');
      word = replaceAll(word, 'N', 'ñ');
      word = replaceAll(word, 'A', 'á');
      word = replaceAll(word, 'E', 'é');
      word = replaceAll(word, 'I', 'í');
      word = replaceAll(word, 'O', 'ó');
      word = replaceAll(word, 'U', 'ú');
      word = word.trim();
      verse2.push(word);
    }
    poem2.push(verse2.join(' '));
  }
  return poem2;
}

function slide_wrap(poem) {
  let p = _('slide_letterform_whitespace').value;
  if (p == 100) {
    return poem;
  }
  p = p / 100;
  let poem2 = [];
  RNG.randomize(SEED);
  for (let verse of poem) {
    let verse2 = [];
    for (let word of verse.split(' ')) {
      verse2.push(word);
      if (RNG.rnd() > p) {
        poem2.push(verse2.join(' '));
        if (RNG.rnd() > 0.01) {
          verse2 = [];
        }
      }
    }
    if (verse2.length > 0) {
      poem2.push(verse2.join(' '));
    }
  }
  return poem2;
}

function slide() {
  let i_size = _('slide_case_erase_letters').value;
  document.body.style.fontSize = (20 + 4 * i_size / 100) + 'pt';

  let i_hue = _('slide_poem').value;
  let i_sat = _('slide_letterform_whitespace').value;
  let i_lum = _('slide_erase_verses').value;
  let hue = Math.floor(360 * i_hue / 100);
  let sat = Math.floor(20 + 60 * i_sat / 100);
  let lum = Math.floor(70 + 20 * i_lum / 100);
  document.body.style.background = 'hsl(' +  hue + ',' + sat + '%,' + lum + '%)';

  let poem = slide_select_poem();
  poem = slide_replacements(poem);
  poem = slide_dispress(poem);
  poem = slide_case(poem);
  poem = slide_whitespace(poem);
  poem = slide_letterform(poem);
  poem = slide_erase_letters(poem);
  poem = slide_erase_verses(poem);
  poem = slide_wrap(poem);
  poem = fix_punctuation(poem);
  let poemElem = _('poem');
  clearElem(poemElem);
  for (let verse of poem) {
    poemElem.appendChild(TEXT(verse));
    poemElem.appendChild(BR());
  }
}

function main() {
  VERSES = shuffle(VERSES);
  let control = _('control');
  let sliders = [
    ["slide_poem", slide, 0, 99]
  ];
  let more_sliders = [
    ["slide_case_erase_letters", slide, 0, 100],
    ["slide_letterform_whitespace", slide, 0, 100],
    ["slide_erase_verses", slide, 0, 100],
    ["slide_replacements_wrap", slide, 0, 100],
    ["slide_dispress", slide, 0, 100],
  ];
  for (let s of shuffle(more_sliders)) {
    sliders.push(s);
  }
  for (let [slider_id, slider_action, slider_min, slider_max] of sliders) {
    let sliderElem = document.createElement('input');
    let sliderDescriptionElem = document.createTextNode('');
    sliderElem.type = 'range';
    sliderElem.min = slider_min;
    sliderElem.max = slider_max;
    // Pick random initial value
    let dist = slider_max - slider_min;
    let q;
    if (slider_id == 'slide_poem' || slider_id == 'slide_erase_verses') {
      q = Math.floor(slider_min + Math.random() * dist);
    } else {
      q = Math.floor(95 + Math.random() * 4);
    }
    sliderElem.value = q;
    sliderElem.id = slider_id;
    sliderElem.oninput = function () {
      sliderDescriptionElem.textContent = sliderElem.value;
      slider_action();
    };
    sliderDescriptionElem.textContent = sliderElem.value;
    control.appendChild(sliderElem);
    control.appendChild(sliderDescriptionElem);
    control.appendChild(BR());
  }
  slide();
}

