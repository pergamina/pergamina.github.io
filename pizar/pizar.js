
const MATCHES_LIMIT = 100;
const TRIES_LIMIT = 20;

function randrange(n) {
  return Math.floor(Math.random() * n);
}

function random_choice(list) {
  return list[randrange(list.length)];
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

class PrefixTree {

  constructor() {
    this._root = this._makeNode();
  }

  _makeNode() {
    return {exists: false, children: {}};
  }

  insert(word) {
    this._root = this._insert(this._root, word, 0);
  }

  get(word) {
    return this.getFrom(this._root, word);
  }

  getFrom(node, word) {
    for (let c of word) {
      if (c in node.children) {
        node = node.children[c];
      } else {
        return null;
      }
    }
    return node;
  }

  _insert(node, word, i) {
    if (i == word.length) {
      node.exists = true;
    } else {
      let c = word[i];
      if (!(c in node.children)) {
        node.children[c] = this._makeNode();
      }
      node.children[c] = this._insert(node.children[c], word, i + 1);
    }
    return node;
  }

}

let G_prefixTree = new PrefixTree();

function normalize(str) {
  str = str.toLowerCase();
  str = str.replace(/á/g, 'a');
  str = str.replace(/é/g, 'e');
  str = str.replace(/í/g, 'i');
  str = str.replace(/ó/g, 'o');
  str = str.replace(/ú/g, 'u');
  str = str.replace(/ü/g, 'u');
  str = str.replace(/Á/g, 'a');
  str = str.replace(/É/g, 'e');
  str = str.replace(/Í/g, 'i');
  str = str.replace(/Ó/g, 'o');
  str = str.replace(/Ú/g, 'u');
  str = str.replace(/Ü/g, 'u');
  str = str.replace(/Ñ/g, 'ñ');
  str = str.replace(/[^ña-z]/g, ' ');
  return str;
}

function findSubsequence(prefixTree, line) {

  function matchLength(match) {
    let n = 0;
    while (match != null) {
      let [history, numWord, index, node] = match;
      n += 1
      match = history;
    }
    return n;
  }

  function matchIndices(match) {
    let indices = [];
    while (match != null) {
      let [history, numWord, index, node] = match;
      indices.unshift([numWord, index]);
      match = history;
    }
    return indices;
  }

  function matchWords(match) {
    let words = [];
    let word = [];
    let lastWord = 0;
    for (let [w, i] of matchIndices(match)) {
      if (w > lastWord) {
        words.push(word.join(''));
        word = [];
        lastWord = w;
      }
      word.push(line[i]);
    }
    words.shift();
    words.push(word.join(''));
    return words;
  }

  function lineContainsAny(line, words) {
    let wideLine = ' ' + line + ' ';
    for (let word of words) {
      if (wideLine.indexOf(' ' + word + ' ') !== -1) {
        return true;
      }
    }
    return false;
  }

  line = normalize(line);
  let allMatches = [];
  for (let i in line) {
    let matches = [];

    let character = line[i];

    let node = prefixTree.get(character);
    if (node !== null) {
      matches.push([null, 1, i, node]);
    }
    for (let j = 0; j < i; j++) {
      for (let prevMatch of allMatches[j]) {
        let [prevHistory, prevNumWord, prevIndex, prevNode] = prevMatch;
        let node = prefixTree.getFrom(prevNode, character)
        if (node !== null) {
          matches.push([prevMatch, prevNumWord, i, node])
        }
        // Allow more than one consecutive word
        if (prevNode.exists && prevIndex + 2 < i) {
          let node = prefixTree.get(character)
          if (node !== null) {
            matches.push([prevMatch, prevNumWord + 1, i, node])
          }
        }
      }
      if (matches.length > MATCHES_LIMIT) {
        matches = shuffle(matches).slice(0, MATCHES_LIMIT);
      }
    }
    allMatches.push(matches)
  }

  let candidates = [];
  let maxScore = 0;
  for (let matches of allMatches) {
    for (let match of matches) {
      let [history, numWord, index, node] = match;
      if (!node.exists || lineContainsAny(line, matchWords(match))) {
        continue;
      }
      let ml = matchLength(match);
      let score = random_choice([numWord, ml, Math.sqrt(numWord) * ml, numWord * ml]);
      maxScore = Math.max(score, maxScore);
      candidates.push([score, match]);
    }
  }
  candidates = candidates.sort(function (a, b) { return b[0] - a[0]; });
  candidates = candidates.slice(0, Math.floor(1 + candidates.length / 4));
  if (candidates.length === 0) {
    return null;
  } else {
    let candidate = random_choice(candidates);
    let [score, match] = candidate;
    return matchIndices(match);
  }
}

function splitLines(source) {
  source = source.replace(/ +/g, ' ');
  source = source.trim();
  let lines = source.split('\n');
  let compactLines = [];
  let line_limit = 20 + Number(_('line_slider').value);
  for (let line of lines) {
    let cs = [];
    let len = 0;
    for (let word of line.split(' ')) {
      if (word.length > line_limit / 2) {
        continue;
      }
      cs.push(word);
      len += word.length;
      if (len > line_limit) {
        compactLines.push(cs.join(' '));
        cs = [];
        len = 0;
      }
    }
    if (len > 0) {
      compactLines.push(cs.join(' '));
    }
  }
  return compactLines;
}

function adjust_bad_color() {
  let p = Math.floor(255 * (1 - Number(_('bad_slider').value) / 100));
  let elems = document.querySelectorAll('.bad');
  for (let elem of elems) {
    elem.style.background = 'rgb(' + p + ',' + p + ',' + p + ')';
  }
}

function pizar() {
  let lines = splitLines(_('input').value);
  if (_('bad_slider').style.visibility == 'hidden') {
    _('bad_slider').value = 95;
  }
  _('bad_slider').style.visibility = 'visible';
  let output = _('output');
  clearElem(output);
  for (let line of lines) {
    let indices = null;
    let tries = 0;
    while (indices === null && tries < TRIES_LIMIT) {
      indices = findSubsequence(G_prefixTree, line);
      tries++;
    }
    if (indices === null) {
      indices = [];
    }
    let good_indices = {};
    for (let [num_word, index] of indices) {
      good_indices[index] = true;
    }
    line = line.toUpperCase();
    for (let i in line) {
      output.appendChild(SPAN1((i in good_indices) ? 'good' : 'bad', TEXT(line[i])));
    }
    output.appendChild(BR());
  }
  adjust_bad_color();
}

function main() {
  for (let word of LEXICON) {
    word = normalize(word);
    if (word.length < 5) {
      continue;
    }
    G_prefixTree.insert(word);
  }
  _('input').focus();
  _('input').select(); 
}

