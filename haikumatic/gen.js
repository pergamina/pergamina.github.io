
/* Generator */

function randrange(n) {
  return Math.floor(Math.random() * n);
}

function random_choice(list) {
  return list[randrange(list.length)];
}

function lists_equal(list1, list2) {
  if (list1.length !== list2.length) {
    return false;
  }
  for (let i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]){
      return false;
    }
  }
  return true;
}

function list_slice(list, i, j) {
  let res = [];
  for (let k = i; k < j; k++) {
    res.push(list[k]);
  }
  return res;
}

function flatten(list) {
  let res = [];
  for (let x of list) {
    res = res.concat(x);
  }
  return res;
}

// Given a list [[w1, x1], ..., [wn, xn]] select one of the xi 
// with frequency proportional to wi/(w1+...+wn).
function random_weighted_choice(list) {
  let sum = 0;
  for (let [weight, _] of list) {
    sum += weight;
  }
  let r = Math.random() * sum;
  let acc = 0;
  for (let [weight, elem] of list) {
    acc += weight;
    if (r <= acc) {
      return elem;
    }
  }
  return list[0];
}

function capitalize(x) {
  if (x.length === 0) {
    return x;
  }
  return x[0].toUpperCase() + x.substring(1, x.length);
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

// Given a list [[w1, x1], ..., [wn, xn]] shuffle it so that
// xi comes before xj with greater probability if it has greater
// weight.
function random_weighted_shuffle(list) {
  if (list.length <= 1) {
    return list;
  }
  // Split
  let l1 = [];
  let l2 = [];
  let i = 0;
  let m = Math.floor(list.length / 2);
  for (let x of list) {
    if (i < m) {
      l1.push(x);
    } else {
      l2.push(x);
    }
    i += 1;
  }
  // Recurse
  l1 = random_weighted_shuffle(l1);
  l2 = random_weighted_shuffle(l2);
  // Random merge
  let res = [];
  while (l1.length !== 0 && l2.length !== 0) {
    let w1 = l1[0][0];
    let w2 = l2[0][0];
    if (Math.random() * (w1 + w2) <= w1) {
      res.push(l1.pop());
    } else {
      res.push(l2.pop());
    }
  }
  res = res.concat(l1);
  res = res.concat(l2);
  return res;
}

// Given a list of generators [g1, ..., gN] return
// the cartesian product of the output.
function generator_product(generators) {
  function _generator_product_from(generators, i) {
    if (i === generators.length) {
      return [[]];
    }
    let res = [];
    for (let x of generators[i]) {
      for (let xs of _generator_product_from(generators, i + 1)) {
        res.push([x].concat(xs));
      }
    }
    return res;
  }
  let lists = [];
  for (let gen of generators) {
    let list = [];
    for (let x of gen) {
      list.push(x);
    }
    lists.push(list);
  }
  return _generator_product_from(lists, 0);
}

function random_concat_of_product(lists) {
  let res = [];
  for (let lst of lists) {
    res = res.concat(random_choice(lst));
  }
  return res;
}

function ways_to_sum(n, k) {
  // Ways to sum n with k strictly positive integers.
  if (k > n) {
    return [];
  } else if (k === 0) {
    return n === 0 ? [[]] : [];
  } else if (k === 1) {
    return [[n]];
  }
  let res = [];
  for (let i = 1; i <= n - 1; i++) {
    for (let lst of ways_to_sum(n - i, k - 1)) {
      res.push([i].concat(lst));
    }
  }
  return res;
}

function is_punctuation(symbol) {
  let punctuation = ['.', ',', ';', ':', '(', ')', '¡', '!', '¿', '?', '–'];
  return punctuation.indexOf(symbol) !== -1;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function do_progress(str) {
  str += '.';
  if (str.length > 30) {
    str = '.';
  }
  return str;
}

class RandomWordSelector {

  constructor(available_word_sets, word_popularity, morphology) {
    this._available_word_sets = [];
    for (let word_set of available_word_sets) {
      this._available_word_sets.push([1, word_set]);
    }
    this._word_popularity = word_popularity;
    this._morphology = morphology;
    this._first_weight = 0.7;
    this._saved_recent = [];
    this._recent = [];
  }

  save() {
    this._saved_recent = [...this._recent];
  }

  restore() {
    this._recent = [...this._saved_recent];
  }

  available_words_with_weight() {
    let res = [];
    // Words from one word set
    for (let [ws_weight, word_set] of this._available_word_sets) {
      let i = 0;
      for (let word of word_set) {
        let weight = ws_weight * this._word_weight(word, i);
        for (let word_variation of this._morphology.variations(word)) {
          res.push([weight, word_variation]); 
        }
        i += 1;
      }
    }
    return res;
  }

  available_words() {
    let res = [];
    for (let [_, word_set] of this._available_word_sets) {
      for (let word of word_set) {
        res.push(word);
      }
    }    
    return res;
  }

  _select_word(variation_fn) {
    let options = [];
    let ws_index = -1;
    let word_root = '';
    for (let [ws_weight, word_set] of this._available_word_sets) {
      ws_index += 1;
      let word_index = 0;
      for (let word of word_set) {
        let weight = ws_weight * this._word_weight(word, word_index);
        let variations = variation_fn(word);
        for (let word_variation of variations) {
          options.push([weight, [ws_index, word, word_variation]]); 
        }
        word_index += 1;
      }
    }
    if (options.length === 0) {
      return []; // No options left
    }
    let [wsc_index, root, word_variation] = random_weighted_choice(options);
    // Update weight of word_set
    let [wsc_weight, wsc] = this._available_word_sets[wsc_index]; 
    let new_weight = wsc_weight / 2;
    if (new_weight < 0.0001) {
      new_weight = 1;
    }
    this._available_word_sets[wsc_index] = [new_weight, wsc];

    // Discourage choosing a recent root twice
    if (this._recent.indexOf(root) !== -1
        && Math.random() < 0.9 * (1 - 1 / options.length)) {
      return this._select_word(variation_fn);
    } else {
      this._recent.push(root);
      if (this._recent.length > 34) {
        this._recent.shift();
      }
    }
    return [word_variation];
  }

  select_noun(gender, number) {
    let self = this;
    return this._select_word(function (word) {
      return self._morphology.noun_variations(word, gender, number);
    });
  }

  select_proper_noun(gender, number) {
    let self = this;
    return this._select_word(function (word) {
      return self._morphology.proper_noun_variations(word, gender);
    });
  }

  select_adjective(gender, number) {
    let self = this;
    return this._select_word(function (word) {
      return self._morphology.adjective_variations(word, gender, number);
    });
  }

  select_verb(type, tense, person, number) {
    let self = this;
    return this._select_word(function (word) {
      return self._morphology.verb_variations(word, type, tense, person, number);
    });
  }

  _word_weight(word, index) {
    let weight;
    let p = word in this._word_popularity
            ? Math.max(this._word_popularity[word], 1)
            : 1;
    if (index == 0) {
      weight = this._first_weight * Math.sqrt(Math.sqrt(1 / p));
    } else {
      weight = Math.sqrt(1 / p) *
               ((1 - this._first_weight) / Math.sqrt(index));
    }
    return weight;
  }

  select_word_by_type(config, symbol) {
    if (symbol.startsWith('N#')) {
      let gender = symbol[2];
      let number = symbol[4];
      return this.select_noun(gender, number);
    } else if (symbol.startsWith('NPROP#')) {
      let gender = symbol[6];
      return this.select_proper_noun(gender);
    } else if (symbol.startsWith('ADJ#')) {
      let gender = symbol[4];
      let number = symbol[6];
      return this.select_adjective(gender, number);
    } else if (symbol.startsWith('VT#')) {
      let person = symbol[3];
      let number = symbol[5];
      return this.select_verb(TYPE_VT, config.tense, person, number);
    } else if (symbol.startsWith('VI#')) {
      let person = symbol[3];
      let number = symbol[5];
      return this.select_verb(TYPE_VI, config.tense, person, number);
    } else if (symbol.startsWith('VPRNL#')) {
      let person = symbol[6];
      let number = symbol[8];
      return this.select_verb(TYPE_VPRNL, config.tense, person, number);
    } else {
      return [];
    }
  }

  available_token(config, token) {
    let options = this.select_word_by_type(config, token);
    return options.length !== 0;
  }

}

class HaikuGenerator {

  constructor() {
    this._empty_word_id = this._get_empty_word_id();
    this._phonetics = new LanguagePhonetics();
    this._morphology = new LanguageMorphology();
    this._word_popularity = this._calculate_word_popularity();
    this._personality = {
      'spanish_syllable_count': Math.random() > 0.1,
      'use_naive_generator': true,
    };
    this._cached_templates = null;
  }

  generate(show_progress, matrix) {
    return this._generate(show_progress, matrix);
  }

  _get_empty_word_id() {
    let i = 0;
    for (let word of WORDS) {
      if (word === '{nada}') {
        return i;
      }
      i += 1;
    }
    return -1;
  }

  async _generate(show_progress, matrix) {
    this._mutate_personality();
    if (this._personality.use_naive_generator) {
      return this._naive_generate(show_progress, matrix);
    } else {
      return this._smart_generate(show_progress, matrix);
    }
  }

  _mutate_personality() {
    if (randrange(10) === 0) {
      this._personality.spanish_syllable_count = Math.random() > 0.1;
    }
    if (randrange(10) === 0) {
      this._personality.use_naive_generator =
        !this._personality.use_naive_generator;
    }
  }

  // Count verse length
  _verse_length(verse) {
    if (this._personality.spanish_syllable_count) {
      // Spanish metric rules, with synalepha and oxytone/proparoxytone diffs.
      let pattern = this._phonetics.verse_spanish_stress_pattern(verse);
      let t = 0;
      for (let i = pattern.length - 1; i >= 0; i--) {
        if (pattern[i] === 'x') {
          break;
        }
        t++;
      }
      return pattern.length + (t == 0 ? 1 : t >= 2 ? -1 : 0);
    } else {
      return this._phonetics.verse_naive_syllable_count(verse);
    }
  }

  // Produce one parse tree.
  // tree ::= ['LIT', string]
  //        | ['T', terminal_symbol, word]  (word instanceof morph.Word)
  //        | ['NT', nonterminal_symbol, [tree1, ..., treeN]]
  _grammar_produce1(word_selector, config, grammar, symbol) {
    if (symbol.length === 0) {
      throw Error("Empty symbol.");
    } else if (!is_upper(symbol[0])) {
      return ['LIT', symbol];
    } else if (symbol.startsWith('N#')) {
      let gender = symbol[2];
      let number = symbol[4];
      return ['T', symbol, word_selector.select_noun(gender, number)[0]];
    } else if (symbol.startsWith('NPROP#')) {
      let gender = symbol[6];
      return ['T', symbol, word_selector.select_proper_noun(gender)[0]];
    } else if (symbol.startsWith('ADJ#')) {
      let gender = symbol[4];
      let number = symbol[6];
      return ['T', symbol, word_selector.select_adjective(gender, number)[0]];
    } else if (symbol.startsWith('VT#')) {
      let person = symbol[3];
      let number = symbol[5];
      return ['T', symbol,
        word_selector.select_verb(TYPE_VT, config.tense, person, number)[0]
      ];
    } else if (symbol.startsWith('VI#')) {
      let person = symbol[3];
      let number = symbol[5];
      return ['T', symbol,
        word_selector.select_verb(TYPE_VI, config.tense, person, number)[0]
      ];
    } else if (symbol.startsWith('VPRNL#')) {
      let person = symbol[6];
      let number = symbol[8];
      return ['T', symbol,
        word_selector.select_verb(TYPE_VPRNL, config.tense, person, number)[0]
      ];
    } else if (!(symbol in grammar)) {
      throw Error("Nonterminal symbol " + symbol + " not in grammar.");
    }
    let productions = grammar[symbol];
    let res = [];
    let terms = random_weighted_choice(productions);
    for (let term of terms) {
      res.push(this._grammar_produce1(word_selector, config, grammar, term));
    }
    return ['NT', grammar[symbol], res];
  }

  // Produce a stream of parse trees (as a generator).
  *_grammar_produce_gen(word_selector, config, grammar, symbol, upper_bound) {
    if (symbol.length === 0) {
      yield ['LIT', ''];
      return;
    } else if (!is_upper(symbol[0])) {
      yield ['LIT', symbol];
      return;
    } else if (symbol.startsWith('N#')) {
      let gender = symbol[2];
      let number = symbol[4];
      for (let word of word_selector.select_noun(gender, number)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (symbol.startsWith('NPROP#')) {
      let gender = symbol[6];
      for (let word of word_selector.select_proper_noun(gender)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (symbol.startsWith('ADJ#')) {
      let gender = symbol[4];
      let number = symbol[6];
      for (let word of word_selector.select_adjective(gender, number)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (symbol.startsWith('VT#')) {
      let person = symbol[3];
      let number = symbol[5];
      for (let word of word_selector.select_verb(TYPE_VT, config.tense,
                                                 person, number)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (symbol.startsWith('VI#')) {
      let person = symbol[3];
      let number = symbol[5];
      for (let word of word_selector.select_verb(TYPE_VI, config.tense,
                                                 person, number)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (symbol.startsWith('VPRNL#')) {
      let person = symbol[6];
      let number = symbol[8];
      for (let word of word_selector.select_verb(TYPE_VPRNL, config.tense,
                                                 person, number)) {
        yield ['T', symbol, word];
      }
      return;
    } else if (!(symbol in grammar)) {
      throw Error("Nonterminal symbol " + symbol + " not in grammar.");
    }
    let productions = random_weighted_shuffle(grammar[symbol]);
    let yielded = 0;
    for (let [_, terms] of productions) {
      if (terms.length > upper_bound) {
        continue;
      }
      let generators = [];
      for (let term of terms) {
        generators.push(
          this._grammar_produce_gen(
            word_selector, config, grammar, term, upper_bound - terms.length + 1
          )
        );
      }
      for (let res of generator_product(generators)) {
        yield ['NT', grammar[symbol], res];
        yielded += 1;
      }
      if (yielded > 0) {
        break;
      }
    }
  }

  // Produce lists of tokens that reach the given length (in *words*)
  // by dynamic programming.
  async _grammar_dp_reach_length(show_progress, config, word_selector,
                                 grammar, symbol,
                                 breadth, min_length, max_length) {
    if (this._cached_templates !== null && Math.random() < 0.5) {
      return this._cached_templates;
    }
    let res = await this._grammar_dp_reach_length_calc(
                 show_progress, config, word_selector,
                 grammar, symbol,
                 breadth, min_length, max_length);
    this._cached_templates = res;
    return res;
  }

  async _grammar_dp_reach_length_calc(
                                 show_progress, config, word_selector,
                                 grammar, symbol,
                                 breadth, min_length, max_length) {

    function is_token(symbol) {
      return symbol.startsWith('N#')
          || symbol.startsWith('NPROP#')
          || symbol.startsWith('ADJ#')
          || symbol.startsWith('VT#')
          || symbol.startsWith('VI#')
          || symbol.startsWith('VPRNL#');
    }

    function is_terminal(symbol) {
      return symbol.length == 0
          || !is_upper(symbol[0])
          || is_token(symbol);
    }

    let T = {};

    let all_nonterminals = [];
    for (let nonterminal in grammar) {
      all_nonterminals.unshift(nonterminal); // reversed
    }
    let progress = '.';
    for (let L = 0; L <= max_length; L++) {
      show_progress(progress);
      progress += '.';
      await sleep(10);

      T[L] = {};
      for (let nonterminal of all_nonterminals) {
        T[L][nonterminal] = [];
      }
      for (let nonterminal of all_nonterminals) {
        let productions = grammar[nonterminal];
        for (let [_, terms] of productions) {
          // Count number of terminal and non-terminal symbols in RHS.
          let num_terminals = 0;
          let num_nonterminals = 0;
          for (let symbol of terms) {
            if (is_punctuation(symbol)) {
              // ignore
            } else if (is_terminal(symbol)) {
              num_terminals++;
            } else {
              num_nonterminals++;
            }
          }
          if (num_terminals > L) {
            // Cannot reach this length with this production.
            continue;
          }
          // Calculate the remaining length
          // (to be distributed among non-terminals).
          let remaining_length = L - num_terminals;
          let combinations = ways_to_sum(remaining_length, num_nonterminals);
          combinations = shuffle(combinations);
          for (let k = 0; k < Math.min(combinations.length, breadth); k++) {
            let comb = combinations[k];
            let options = [];
            let i = 0;
            for (let term of terms) {
              if (is_token(term) && !word_selector.available_token(config, term)) {
                options.push([]);
              } else if (is_terminal(term)) {
                options.push([[term]]);
              } else {
                options.push(T[comb[i]][term]);
                i += 1;
              }
            }
            let some_empty = false;
            for (let lst of options) {
              if (lst.length === 0) {
                some_empty = true;
              }
            }
            if (some_empty) {
              continue;
            }
            for (let t = 0; t < breadth; t++) {
              let option = random_concat_of_product(options);
              let repeated = false;
              for (let other of T[L][nonterminal]) {
                if (lists_equal(option, other)) {
                  repeated = true;
                  break;
                }
              }
              if (!repeated) {
                T[L][nonterminal].push(option);
              }
            }
          }
        }
      }
    }
    let res = [];
    for (let length = min_length; length <= max_length; length++) {
      res = res.concat(T[length][symbol]);
    }
    return res;
  }

  _parsetree_to_string(parsetree) {
    if (parsetree[0] === 'LIT') {
      return parsetree[1];
    } else if (parsetree[0] === 'T') {
      return parsetree[2].form();
    } else if (parsetree[0] === 'NT') {
      let res = [];
      for (let subtree of parsetree[2]) {
        res.push(this._parsetree_to_string(subtree));
      }
      return res.join(' ');
    }
  }

  _parsetree_repr(parsetree) {
    if (parsetree[0] === 'LIT') {
      return parsetree[1];
    } else if (parsetree[0] === 'T') {
      return parsetree[1];
    } else if (parsetree[0] === 'NT') {
      let res = [];
      for (let subtree of parsetree[2]) {
        res.push(this._parsetree_repr(subtree));
      }
      return res.join(' ');
    }
  }

  _calculate_word_popularity() {
    let word_popularity = {};
    for (let id = 0; id < NUM_EMOJIS; id++) {
      for (let id2 of this._reachable_ids_from([id])) {
        let word = WORDS[id2];
        if (!(word in word_popularity)) {
          word_popularity[word] = 0;
        }
        word_popularity[word]++;
      }
    }
    return word_popularity;
  }

  _reachable_ids_from(ids0) {
    let queue = [];
    let knownIds = {};
    let reachableIds = [];
    for (let id of ids0) {
      knownIds[id] = true;
      queue.push(id);
    }
    while (queue.length > 0) {
      let id = queue.shift();
      if (!(id in LEXICON)) {
        continue;
      }
      for (let concept of LEXICON[id]) {
        let id2 = concept.word_id();
        if (!(id2 in knownIds)) {
          knownIds[id2] = true;
          reachableIds.push(id2);
          queue.push(id2);
        }
      }
    }
    return reachableIds;
  }

  _reachable_words_from(ids0) {
    let reachableIds = this._reachable_ids_from(ids0);
    let reachableWords = [];
    for (let id of reachableIds) {
      let word = WORDS[id];
      if (!this._is_valid_word(word)) {
        continue;
      }
      reachableWords.push(word);
    }
    return reachableWords;
  }

  _is_valid_word(word) {
    return word !== '' && word[0] !== '{';
  }

  _connected_components(matrix) {
    let n = matrix.length;
    let m = matrix[0].length;

    function pair_key(i, j) {
      return m * i + j;
    }

    // Union-find

    let repr = {};

    function find(k) {
      if (k in repr) {
        let k1 = find(repr[k]);
        repr[k] = k1;
        return k1;
      } else {
        return k;
      }
    }

    function union(k1, k2) {
      let r1 = find(k1);
      let r2 = find(k2);
      if (r1 !== r2) {
        repr[r1] = r2;
      }
    }

    // Visit neighbors
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] === EMPTY) {
          continue;
        }
        for (let ii = i - 1; ii <= i + 1; ii++) {
          for (let jj = j - 1; jj <= j + 1; jj++) {
            if ((i === ii && j === jj)                     // no self-neighbors
                || ii < 0 || ii >= n || jj < 0 || jj >= m  // border conditions
                || matrix[ii][jj] === EMPTY) {             // non-empty
              continue;
            }
            union(pair_key(i, j), pair_key(ii, jj));
          }
        }
      }
    }

    // Collect connected components
    let ccs_by_key = {};
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] === EMPTY) {
          continue;
        }
        let key = find(pair_key(i, j));
        if (!(key in ccs_by_key)) {
          ccs_by_key[key] = [];
        }
        ccs_by_key[key].push([i, j]);
      }
    }

    let connected_components = [];
    for (let key in ccs_by_key) {
      connected_components.push(ccs_by_key[key]);
    }
    return connected_components;
  }

  _matrix_horizontal_balance_factor(matrix) {
    let n = matrix.length;
    let m = matrix[0].length;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] !== EMPTY) {
          sum += j;
          count += 1;
        }
      }
    }
    if (count === 0) {
      return 1;
    } else {
      return sum / (count * m);
    }
  }

  //// Naive generator

  _naive_word_selector(matrix) {
    let available_word_sets = [];
    let connected_components = this._connected_components(matrix);
    if (connected_components.length === 0) {
      available_word_sets.push(this._reachable_words_from([this._empty_word_id]));
    } else {
      let component = random_choice(connected_components);
      for (let pos of component) {
        let i = pos[0];
        let j = pos[1];
        available_word_sets.push(this._reachable_words_from([matrix[i][j]]));
      }
    }
    return new RandomWordSelector(
                 available_word_sets,
                 this._word_popularity,
                 this._morphology
               );
  }

  async _naive_generate(show_progress, matrix) {
    let word_selector = this._naive_word_selector(matrix);
    // Tense is given by the horizontal balance factor.
    let balance = this._matrix_horizontal_balance_factor(matrix);
    let tense = TENSE_PRES;
    if (balance < 0.4) {
      tense = random_choice([TENSE_PRETI, TENSE_PRETP]);
    }
    let grammar = cfg_expand({
      'Start': [
        'MinorSentence',
        'MajorSentence',
      ],
      'MinorSentence': [
        'SNounPhrase.gs.ns',
        [1.5, 'Preposition NounPhrase.gs.ns'],
        (Math.random() < 0.1 ? [0.01, 'Interj SNounPhrase.gs.ns']
                             : 'NounPhrase.gs.ns'),
      ],
      'MajorSentence': [
        'NounPhrase.gs.ns VT.#3.ns NounPhrase.go.no',
        'NounPhrase.gs.ns Be.#3.ns NounPhrase.go.no',
        'NounPhrase.gs.ns VI.#3.ns',
        'VI.#3.ns NounPhrase.gs.ns',
        'NounPhrase.gs.ns VPRNL.#3.ns',
        'VT.#1.ns NounPhrase.go.no',
        'VT.#2.ns NounPhrase.go.no',
        'Adverb? DirectObject VT.#1.ns',
        'Adverb? DirectObject VT.#2.ns',
        'Adverb? VPRNL.#1.ns',
        'Adverb? VPRNL.#2.ns',
      ],
      'Adverb?': [
        [50, ''],
        'así', [0.1, 'quizá'], [0.1, 'quizás'], 'acaso', 'siempre', 'nunca',
        'jamás', (tense == TENSE_PRES ? 'hoy' : 'ayer'),
        'entonces',
      ],
      'DirectObject': [
        'lo', 'la', 'los', 'las',
      ],
      'SNounPhrase.g.n': [
        'NounPhrase.g.n',
        'ADJ.g.n N.g.n',
        'N.g.n ADJ.g.n',
        'N.g.n de N.g2.n2',
      ],
      'NounPhrase.g.n': [
        'Art.g.n N.g.n',
        'Art.g.n ADJ.g.n N.g.n',
        'Art.g.n N.g.n ADJ.g.n',
        'PossPron.g.n N.g.n',
        'PossPron.g.n N.g.n ADJ.g.n',
        'PossPron.g.n ADJ.g.n N.g.n',
        'Art.g.n N.g.n de N.g2.n2',
        'N.g.n de Art.g2.n2 N.g2.n2',
      ],
      'NounPhrase.#m.#p': [
        [0.1, 'todos los N.#m.#p'],
        [0.1, 'algunos N.#m.#p'],
      ],
      'NounPhrase.#f.#p': [
        [0.1, 'todas las N.#f.#p'],
        [0.1, 'algunas N.#f.#p'],
      ],
      'NounPhrase.g.#s': [
        'NPROP.g',
      ],
      'Preposition': [
        'bajo', 'con', 'contra', 'desde', 'en', 'entre', 'hacia', 'hasta',
        'para', 'sin', 'sobre', 'tras',
      ],
      'Interj': [
        'ah', 'oh', 'ay',
      ],
      'Art.#m.#s': ['el', 'este', 'ese', 'aquel', 'un'],
      'Art.#m.#p': ['los', 'estos', 'esos', 'aquellos', 'unos'],
      'Art.#f.#s': ['la', 'esta', 'esa', 'aquella', 'una'],
      'Art.#f.#p': ['las', 'estas', 'esas', 'aquellas', 'unas'],
      'PossPron.#m.#s': ['mi', 'tu', 'nuestro'],
      'PossPron.#m.#p': ['mis', 'tus', 'nuestros'],
      'PossPron.#f.#s': ['mi', 'tu', 'nuestra'],
      'PossPron.#f.#p': ['mis', 'tus', 'nuestras'],
      'Be.#3.#s': ['es'],
      'Be.#3.#p': ['son'],
    });

    // Generate sentences from the grammar
    let config = {
      'tense': tense,
    };
    
    let verses = [];
    // First verse
    let progress = '.';
    for (let i = 0; i < 100 && verses.length < 1; i++) {
      progress = do_progress(progress);
      show_progress(progress);
      await sleep(10);
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start', 5)) {
        let verse = this._parsetree_to_string(parsetree);
        if (this._verse_length(verse) === 5) {
          verses.push(this._phonetics.apply_contractions(verse));
          word_selector.save();
        }
      }
    }
    for (let i = 0; i < 100 && verses.length < 2; i++) {
      progress = do_progress(progress);
      show_progress(progress);
      await sleep(10);
      word_selector.restore();
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start', 7)) {
        let verse = this._parsetree_to_string(parsetree);
        if (this._verse_length(verse) === 7) {
          verses.push(this._phonetics.apply_contractions(verse));
          word_selector.save();
        }
      }
    }
    for (let i = 0; i < 100 && verses.length < 3; i++) {
      progress = do_progress(progress);
      show_progress(progress);
      await sleep(10);
      word_selector.restore();
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start', 5)) {
        let verse = this._parsetree_to_string(parsetree);
        if (this._verse_length(verse) === 5) {
          verses.push(this._phonetics.apply_contractions(verse));
        }
      }
    }
    return this._naive_punctuate(verses);
  }

  _naive_punctuate(verses) {
    if (verses.length !== 3) {
      return verses;
    }
    if (Math.random() < 0.05) {
      return verses;
    }
    let p0 = random_weighted_choice([
               [500, ''], [500, ','], [10, ';'], [50, ':'], [100, '.'],
               [5, '!'],
             ]);
    let p1 = random_weighted_choice([
               [500, ''], [p0 !== '' ? 10 : 500, ','], [10, ';'], [50, ':'],
               [100, '.'],
             ]);
    let p2 = random_weighted_choice([
               [99, '.'],
               [1, '...'],
               [1, '!'],
             ]);
    let res = [];
    let v0 = (p0 === '!' ? '¡' : '')
           + capitalize(verses[0])
           + (p0 === '!' ? '' : p0);
    res.push(v0);
    let v1 = p0 === '.' ? capitalize(verses[1]) : verses[1];
    res.push(v1 + (p0 === '!' ? '!' : p1));
    let v2 = (p0 === '!' || p1 === '.') ? capitalize(verses[2]) : verses[2];
    if ((p0 === '!' || p1 === '.') && p2 === '!') {
      v2 = '¡' + v2 + '!';
    } else {
      v2 = v2 + (p2 === '!' ? '.' : p2);
    }
    res.push(v2);
    return res;
  }

  //// Smart generator

  _smart_word_selector(matrix) {
    let n = matrix.length;
    let m = matrix[0].length;
    let available_word_sets = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] !== EMPTY) {
          available_word_sets.push(this._reachable_words_from([matrix[i][j]]));
        }
      }
    }
    if (available_word_sets.length === 0) {
      available_word_sets.push(
        this._reachable_words_from([this._empty_word_id])
      );
    }
    return new RandomWordSelector(
                 available_word_sets,
                 this._word_popularity,
                 this._morphology
               );
  }

  _dumb_instantiate_template(config, word_selector, template) {
    let res = [];
    for (let symbol of template) {
      if (symbol.length === 0) {
        continue;
      } else if (!is_upper(symbol[0])) {
        res.push(symbol);
      } else {
        let ws = word_selector.select_word_by_type(config, symbol);
        if (ws.length !== 0) {
          res.push(ws[0].form());
        }
      }
    }
    return res.join(' ');
  }

  _smart_instantiate_template(config, word_selector, template, verse_lengths, acum_verses) {
    let self = this;
    function match_length(verse, n) {
      return self._verse_length(verse) == n;
    }
    if (template.length > 0 && (is_punctuation(template[0]) || template[0] == '')) {
      let symbol = template[0];
      template.shift();
      if (symbol !== '') {
        acum_verses[acum_verses.length - 1].push(symbol);
      }
      let res = this._smart_instantiate_template(
                  config, word_selector, template, verse_lengths, acum_verses
                );
      if (symbol !== '') {
        acum_verses[acum_verses.length - 1].pop();
      }
      template.unshift(symbol);
      return res;
    }
    if (template.length === 0 && verse_lengths.length === 0) {
      let res = [];
      for (let verse of acum_verses) {
        res.push(this._phonetics.apply_contractions(verse.join(' ')));
      }
      return [res];
    }
    let v0_length = verse_lengths[0];
    let ac_length = this._verse_length(acum_verses[acum_verses.length - 1].join(' '));
    if (v0_length < ac_length) {
      // We have exceeded the expected length.
      return [];
    } else if (v0_length === ac_length) {
      verse_lengths.shift();
      acum_verses.push([]);
      let res = this._smart_instantiate_template(
                  config, word_selector, template, verse_lengths, acum_verses
                );
      acum_verses.pop();
      verse_lengths.unshift(v0_length);
      return res;
    }
    if (template.length === 0){
      // Template too short
      return [];
    }
    if (verse_lengths.length === 0) {
      // Template too long
      return [];
    }
    let symbol = template[0];
    if (!is_upper(symbol[0])) {
      template.shift();
      acum_verses[acum_verses.length - 1].push(symbol);
      let res = this._smart_instantiate_template(
                  config, word_selector, template, verse_lengths, acum_verses
                );
      acum_verses[acum_verses.length - 1].pop();
      template.unshift(symbol);
      return res;
    } else {
      let TRIES = 3;
      for (let i = 0; i < TRIES; i++) {
        let options = word_selector.select_word_by_type(config, symbol);
        if (options.length === 0) {
          continue;
        }
        template.shift();
        acum_verses[acum_verses.length - 1].push(options[0].form());
        let res = this._smart_instantiate_template(
                    config, word_selector, template, verse_lengths, acum_verses
                  );
        acum_verses[acum_verses.length - 1].pop();
        template.unshift(symbol);
        if (res.length > 0) {
          return res;
        }
      }
      return [];
    }
  }

  async _smart_generate(show_progress, matrix) {
    await sleep(10);
    let word_selector = this._smart_word_selector(matrix);
    let tense = random_choice([TENSE_PRES, TENSE_PRETP, TENSE_PRETI]);
    let grammar = cfg_expand({
      'Start': [
        'Clause .',
        [10, 'Clause , Clause .'],
        [10, 'Clause , Clause , Clause .'],
        [10, 'Clause . Clause .'],
        [10, 'Clause . Clause . Clause .'],
        [10, 'Clause . Clause , Clause .'],
        'Clause – Clause .',
        'Clause . ¡ Clause !',
        'Clause , Clause . ¡ Clause !',
        '¿ Clause ?',
        '¿ Clause ? ¿ Clause ?',
      ],
      'Clause': [
        'MinorSentence',
        'MajorSentence',
      ],
      'MinorSentence': [
        'SNounPhrase.gs.ns',
        [1.5, 'Preposition NounPhrase.gs.ns'],
        (Math.random() < 0.1 ? [0.01, 'Interj SNounPhrase.gs.ns']
                             : 'NounPhrase.gs.ns'),
      ],
      'MajorSentence': [
        'NounPhrase.gs.ns VT.#3.ns NounPhrase.go.no',
        'NounPhrase.gs.ns Be.#3.ns NounPhrase.go.no',
        'NounPhrase.gs.ns VI.#3.ns',
        'VI.#3.ns NounPhrase.gs.ns',
        'NounPhrase.gs.ns VPRNL.#3.ns',
        'VT.#1.ns NounPhrase.go.no',
        'VT.#2.ns NounPhrase.go.no',
        'DirectObject VT.#1.ns',
        'DirectObject VT.#2.ns',
        'VPRNL.#1.ns',
        'VPRNL.#2.ns',
        'Adverb DirectObject VT.#1.ns',
        'Adverb DirectObject VT.#2.ns',
        'Adverb VPRNL.#1.ns',
        'Adverb VPRNL.#2.ns',
      ],
      'Adverb': [
        'así', [0.1, 'quizá'], [0.1, 'quizás'], 'acaso', 'siempre', 'nunca',
        'jamás', (tense == TENSE_PRES ? 'hoy' : 'ayer'),
        'entonces', 'ya',
      ],
      'DirectObject': [
        'lo', 'la', 'los', 'las',
      ],
      'SNounPhrase.g.n': [
        'NounPhrase.g.n',
        'ADJ.g.n N.g.n',
        'N.g.n ADJ.g.n',
        'N.g.n de N.g2.n2',
      ],
      'NounPhrase.g.n': [
        'Art.g.n N.g.n',
        'Art.g.n ADJ.g.n N.g.n',
        'Art.g.n N.g.n ADJ.g.n',
        'PossPron.g.n N.g.n',
        'PossPron.g.n N.g.n ADJ.g.n',
        'PossPron.g.n ADJ.g.n N.g.n',
        'Art.g.n N.g.n de N.g2.n2',
        'Art.g.n N.g.n Preposition Art.g2.n2 N.g2.n2',
      ],
      'NounPhrase.#m.#p': [
        [0.1, 'todos los N.#m.#p'],
        [0.1, 'algunos N.#m.#p'],
      ],
      'NounPhrase.#f.#p': [
        [0.1, 'todas las N.#f.#p'],
        [0.1, 'algunas N.#f.#p'],
      ],
      'NounPhrase.g.#s': [
        'NPROP.g',
      ],
      'Preposition': [
        'bajo', 'con', 'contra', 'desde', 'en', 'entre', 'hacia', 'hasta',
        'para', 'sin', 'sobre', 'tras',
      ],
      'Interj': [
        'ah', 'oh', 'ay',
      ],
      'Art.#m.#s': [[10, 'el'], 'este', 'ese', 'aquel', [10, 'un'], [0.5, 'cada']],
      'Art.#m.#p': [[10, 'los'], 'estos', 'esos', 'aquellos', [10, 'unos']],
      'Art.#f.#s': [[10, 'la'], 'esta', 'esa', 'aquella', [10, 'una'], [0.5, 'cada']],
      'Art.#f.#p': [[10, 'las'], 'estas', 'esas', 'aquellas', [10, 'unas']],
      'PossPron.#m.#s': ['mi', 'tu', 'nuestro'],
      'PossPron.#m.#p': ['mis', 'tus', 'nuestros'],
      'PossPron.#f.#s': ['mi', 'tu', 'nuestra'],
      'PossPron.#f.#p': ['mis', 'tus', 'nuestras'],
      'Be.#3.#s': ['es'],
      'Be.#3.#p': ['son'],
    });
    let config = {'tense': TENSE_PRES};
    let haiku_lengths = [5, 7, 5];

    let rbreadth = randrange(6);
    let rlength = randrange(6);

    let iter = 0;
    for (let time = randrange(3); time < 6; time++) {
      let templates = await this._grammar_dp_reach_length(
                        show_progress,
                        config, word_selector, grammar, 'Start',
                           1 + ((time + rbreadth) % 6) /* breadth */,
                           5 + ((time + rlength) % 6) /* min_length */,
                           7 + ((time + rlength) % 6) /* max_length */,
                      );
      for (let template of templates) {
        show_progress(
          this._phonetics.fix_ortotypography(
            [this._dumb_instantiate_template(config, word_selector, template)]
          )
        );
        await sleep(10);
        let poem = this._smart_instantiate_template(
                     config, word_selector, template, haiku_lengths, [[]]
                   );
        if (poem.length === 0) {
          continue;
        }
        return this._phonetics.fix_ortotypography(poem[0]);
      }
    }
    return [];
  }

}

