
/* Generator */

function randrange(n) {
  return Math.floor(Math.random() * n);
}

function random_choice(list) {
  return list[randrange(list.length)];
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

class RandomWordSelector {

  constructor(available_word_sets, word_popularity, morphology) {
    this._available_word_sets = [];
    for (let word_set of available_word_sets) {
      this._available_word_sets.push([1, word_set]);
    }
    this._word_popularity = word_popularity;
    this._morphology = morphology;
    this._first_weight = 0.7;
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

  /*
  _available_hybrid_words() {
    let res = [];
    let per_prefix = {};
    let per_suffix = {};
    for (let word_set of this._available_word_sets) {
      for (let word of word_set) {
        for (let size = 2; size <= 4; size++) {
          if (size >= word.length) {
            continue;
          }
          let prefix = word.substring(0, size);
          if (!(prefix in per_prefix)) {
            per_prefix[prefix] = {};
          }
          per_prefix[prefix][word] = true;
          let suffix = word.substring(word.length - size, word.length);
          if (!(suffix in per_suffix)) {
            per_suffix[suffix] = {};
          }
          per_suffix[suffix][word] = true;
        }
      }
    }
    for (let fragment in per_prefix) {
      if (!(fragment in per_suffix)) {
        continue;
      }
      for (let w1 in per_suffix[fragment]) {
        for (let w2 in per_prefix[fragment]) {
          res.push([w1, w2]);
        }
      }
    }
  }
  */

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
    for (let [ws_weight, word_set] of this._available_word_sets) {
      ws_index += 1;
      let word_index = 0;
      for (let word of word_set) {
        let weight = ws_weight * this._word_weight(word, word_index);
        let variations = variation_fn(word);
        for (let word_variation of variations) {
          options.push([weight, [ws_index, word_variation]]); 
        }
        word_index += 1;
      }
    }
    if (options.length === 0) {
      return []; // No options left
    }
    let [wsc_index, word_variation] = random_weighted_choice(options);
    // Update weight of word_set
    let [wsc_weight, wsc] = this._available_word_sets[wsc_index]; 
    let new_weight = wsc_weight / 2;
    if (new_weight < 0.0001) {
      new_weight = 1;
    }
    this._available_word_sets[wsc_index] = [new_weight, wsc];
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

}

class HaikuGenerator {

  constructor() {
    this._empty_word_id = this._get_empty_word_id();
    this._phonetics = new LanguagePhonetics();
    this._morphology = new LanguageMorphology();
    this._word_popularity = this._calculate_word_popularity();
    this._personality = {
      'spanish_syllable_count': Math.random() > 0.1,
    };
  }

  generate(matrix) {
    //return this._test(matrix);
    return this._generate(matrix);
  }

  _test(matrix) {

    //// Show the stress pattern of a verse
    let phon = new LanguagePhonetics();
    let res = [];
    res.push(
      phon.apply_contractions('de el médico')
    );
    res.push(
      phon.apply_contractions('a el médico')
    );
    res.push(
      phon.apply_contractions('el médico')
    );
    res.push(
      phon.apply_contractions('la águila')
    );
    res.push(
      phon.apply_contractions('la acción')
    );
    res.push(
      phon.apply_contractions('de la aire')
    );
    res.push(
      phon.apply_contractions('a la hacha')
    );
    return res;

    /*
    //// Generate sentences from a context-free grammar with generators
    let word_selector = this._create_word_selector(matrix);
    let config = {'tense': TENSE_PRES};
    let grammar = {
      'S': ['a B c D'],
      'B': ['b', 'bb', 'bbb'],
      'D': ['d', 'dd', 'ddd'],
    };
    let gen = this._grammar_produce_gen(
                word_selector, config, cfg_expand(grammar), 'S'
              );
    let res = [];
    for (let parsetree of gen) {
      res.push(this._parsetree_to_string(parsetree));
    }
    return res;
    */

    /*
    //// Generate a sentence from a context-free grammar
    let word_selector = this._create_word_selector(matrix);
    let config = {'tense': TENSE_PRES};
    let grammar = {
      'S': ['a B c'],
      'B': ['b', 'bb', 'bbb'],
    };
    return [
      this._parsetree_to_string(
        this._grammar_produce1(word_selector, config, cfg_expand(grammar), 'S')
      )
    ];
    */

    /*
    //// Expand a template context-free grammar
    let grammar = {
      'Start': ['NounPhrase.n.g'],
      'NounPhrase.n.g': [
        [12, 'DetArt.n.g N.n.g'],
        'UndetArt.n.g N.n.g',
      ],
      'DetArt.#s.#m': ['el'],
      'DetArt.#p.#m': ['los'],
      'DetArt.#s.#f': ['la'],
      'DetArt.#p.#f': ['las'],
      'UndetArt.#s.#m': ['un'],
      'UndetArt.#p.#m': ['unos'],
      'UndetArt.#s.#f': ['una'],
      'UndetArt.#p.#f': ['unas'],
    };
    return [cfg_expand(grammar).toSource()];
    */

    /*
    //// Create a word selector and show available words
    let word_selector = this._create_word_selector(matrix);
    return word_selector.available_words_with_weight();
    */

    /*
    //// Show popularity per word
    let res = [];
    let word_popularity = this._calculate_word_popularity();
    for (let word in word_popularity) {
      res.push([word, word_popularity[word]]);
    }
    return res;
    */

    /*
    //// List all reachable words
    let ids0 = [];
    let n = matrix.length;
    let m = matrix[0].length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] != EMPTY) {
          ids0.push(matrix[i][j]);
        }
      }
    }
    if (ids0.length === 0) {
      ids0 = [this._empty_word_id];
    }
    let res = [];
    for (let word of this._reachable_words_from(ids0)) {
      res = res.concat(this._morphology.variations(word));
    }
    return res;
    */

    /*
    //// List all words of a given type
    let res = [];
    for (let word of WORDS) {
      if (!this._is_valid_word(word)) {
        continue;
      }
      for (let v of this._morphology.variations(word)) {
        //if (v.is_adjective()) {
        //if (v.is_noun()) {
        //if (v.is_noun() && v.gender() == GENDER_M) {
        //if (v.is_noun() && v.gender() == GENDER_F) {
        //if (v.is_verb()) {
        //if (v.is_verb() && v.type() == TYPE_VT) {
        //if (v.is_verb() && v.type() == TYPE_VI) {
        if (v.is_verb() && v.type() == TYPE_VPRNL) {
          res.push(v);
        }
      }
    }
    return res;
    */

    /*
    //// Show the stress pattern of a verse
    let phon = new LanguagePhonetics();
    let res = [];
    res.push(
      phon.verse_spanish_stress_pattern('Faltar pudo su patria al grande Osuna.')
    );
    return res;
    */

    /*
    //// Show the stress pattern / position of all words
    let phon = new LanguagePhonetics();
    let res = [];
    for (let word of WORDS) {
      if (!this._is_valid_word(word)) {
        continue;
      }
      res.push(word + ' ('
                    //+ phon.stress_pattern(word) //.join('-')
                    + phon.stress_position(word)
                    + ')');
    }
    return res;
    */

    /*
    //// Test the suffix replacement function
    let phon = new LanguagePhonetics();
    let res = [];
    res.push(phon.replace_suffix_preserving_stress('pan', '', ''));
    res.push(phon.replace_suffix_preserving_stress('imagen', '', 'es'));
    res.push(phon.replace_suffix_preserving_stress('imágen', 'es', ''));
    res.push(phon.replace_suffix_preserving_stress('cant', 'ar', 'amos'));
    res.push(phon.replace_suffix_preserving_stress('amor', '', 'es'));
    res.push(phon.replace_suffix_preserving_stress('fértil', '', 'es'));
    return res;
    */
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

  _generate(matrix) {
    this._mutate_personality();
    return this._naive_generate(matrix);
  }

  _mutate_personality() {
    if (randrange(10) === 0) {
      this._personality.spanish_syllable_count = Math.random() > 0.1;
    }
  }

  _naive_generate(matrix) {
    let word_selector = this._create_word_selector(matrix);
    let grammar = cfg_expand({
      'Start': [
        'MinorSentence',
        'MajorSentence',
      ],
      'MinorSentence': [
        'NounPhrase.gs.ns',
        'Preposition NounPhrase.gs.ns',
      ],
      'MajorSentence': [
        'NounPhrase.gs.ns VT.#3.ns NounPhrase.go.no',
        'NounPhrase.gs.ns VI.#3.ns',
        'VI.#3.ns NounPhrase.gs.ns',
        'NounPhrase.gs.ns VPRNL.#3.ns',
      ],
      'NounPhrase.g.n': [
        'N.g.n de N.g2.n2',
        'ADJ.g.n N.g.n',
        'N.g.n ADJ.g.n',
        'DetArt.g.n N.g.n',
        'DetArt.g.n ADJ.g.n N.g.n',
        'DetArt.g.n N.g.n ADJ.g.n',
        'UndetArt.g.n N.g.n',
        'UndetArt.g.n N.g.n ADJ.g.n',
        'UndetArt.g.n ADJ.g.n N.g.n',
        'PossPron.g.n N.g.n',
        'PossPron.g.n N.g.n ADJ.g.n',
        'PossPron.g.n ADJ.g.n N.g.n',
      ],
      'NounPhrase.g.#s': [
        'NPROP.g',
      ],
      'Preposition': [
        'bajo', 'con', 'contra', 'desde', 'en', 'entre', 'hacia', 'hasta',
        'para', 'sin', 'sobre', 'tras',
      ],
      'DetArt.#m.#s': ['el'],
      'DetArt.#m.#p': ['los'],
      'DetArt.#f.#s': ['la'],
      'DetArt.#f.#p': ['las'],
      'UndetArt.#m.#s': ['un'],
      'UndetArt.#m.#p': ['unos'],
      'UndetArt.#f.#s': ['una'],
      'UndetArt.#f.#p': ['unas'],
      'PossPron.#m.#s': ['mi', 'tu', 'nuestro'],
      'PossPron.#m.#p': ['mis', 'tus', 'nuestros'],
      'PossPron.#f.#s': ['mi', 'tu', 'nuestra'],
      'PossPron.#f.#p': ['mis', 'tus', 'nuestras'],
    });

    // Tense is given by the horizontal balance factor.
    let balance = this._matrix_horizontal_balance_factor(matrix);
    let tense = TENSE_PRES;
    if (balance < 0.4) {
      tense = random_choice([TENSE_PRETI, TENSE_PRETP]);
    }

    // Generate sentences from the grammar
    let config = {
      'tense': tense,
    };
    
    let verses = [];
    // First verse
    for (let i = 0; i < 100 && verses.length < 1; i++) {
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start')) {
        let verse = this._parsetree_to_string(parsetree);
        if (this._verse_length(verse) === 5) {
          verses.push(this._phonetics.apply_contractions(verse));
        }
      }
    }
    for (let i = 0; i < 100 && verses.length < 2; i++) {
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start')) {
        let verse = this._parsetree_to_string(parsetree);
        if (this._verse_length(verse) === 7) {
          verses.push(this._phonetics.apply_contractions(verse));
        }
      }
    }
    for (let i = 0; i < 100 && verses.length < 3; i++) {
      for (let parsetree of this._grammar_produce_gen(word_selector, config,
                                                      grammar, 'Start')) {
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
  *_grammar_produce_gen(word_selector, config, grammar, symbol) {
    if (symbol.length === 0) {
      throw Error("Empty symbol.");
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
      let generators = [];
      for (let term of terms) {
        generators.push(
          this._grammar_produce_gen(word_selector, config, grammar, term)
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

  _create_word_selector(matrix) {
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

}

