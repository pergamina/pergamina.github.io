
/* Phonetic analysis for calculating metric and stress patterns
 * and ortographical/ortotypographical conventions
 */

function rev(str) {
  let res = '';
  for (let c of str) {
    res = c + res;
  }
  return res;
}

function replaceAll(str, source, target) {
  return str.split(source).join(target);
}

class LanguagePhonetics {

  constructor() {
  }

  _phonetics(word) {
    const EXCEPTIONS = {
      'CD': 'sidI', 'DVD': 'dibidI', 'CDs': 'sidIs', 'DVDs': 'dibidIs',
      'copyright': 'kopiRAit', 'copyrights': 'kopiRAits', 'diskette': 'diskEt',
      'diskettes': 'diskEts', 'gay': 'gEi', 'gays': 'gEis', 'pool': 'pUl',
      'pools': 'pUls',
    };
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
    if (word in EXCEPTIONS) {
      return EXCEPTIONS[word];
    }
    word = ' ' + word.toLowerCase() + ' ';
    for (let replacement of REPLACEMENTS) {
      for (let source in replacement) {
        let target = replacement[source];
        word = replaceAll(word, source, target);
      }
    }
    return word.trim();
  }

  _split_closed(syllable) {
    let nclosed = 0;
    let split_pos = 0;
    let i = 0;
    for (let x of syllable) {
      i += 1;
      if ('iuIU'.indexOf(x) !== -1) {
        nclosed += 1;
        if (nclosed == 1) {
          split_pos = i;
        } else if (nclosed === 3) {
          break;
        }
      }
    }
    if (nclosed === 3) {
      return [syllable.substring(0, split_pos),
              syllable.substring(split_pos, syllable.length)]
    } else {
      return [syllable]
    }
  }

  _split_open(syllable) {
    let splits = [];
    let s = '';
    let nopen = 0;
    for (let x of syllable) {
      if ('aeoAEO'.indexOf(x) !== -1) {
        if (nopen === 0) {
          s += x;
          nopen = 1;
        } else {
          splits.push(s);
          s = x;
        }
      } else {
        s += x;
      }
    }
    splits.push(s)
    let res = [];
    for (let x of splits) {
      res = res.concat(this._split_closed(x));
    }
    return res;
  }

  _split_syllables(word) {
    const VOWELS = "aeiouAEIOU";
    const PHONEME_VALUE = {
      't': 40, 
      'p': 50, 'b': 50, 'k': 50, 'd': 50, 'g': 50,
      'f': 60,
      's': 65, 'j': 65,
      'S': 65, 'C': 65, 'R': 65,
      'n': 68,
      'm': 70, 'N': 70,
      'l': 75, 'r': 75,
      'a': 100, 'e': 100, 'i': 100, 'o': 100, 'u': 100,
      'A': 100, 'E': 100, 'O': 100, 
      'I': 200, 'U': 200,
    };

    function get_value(x, other) {
      if (x in PHONEME_VALUE) {
        return PHONEME_VALUE[x];
      } else {
        return other;
      }
    }

    let i = 0;
    let n = word.length;
    let last = 0;
    let cut_points = [];
    while (i < n) {
      if (VOWELS.indexOf(word[i]) != -1) {
        let curval = get_value(word[i], 50);
        let j = i - 1;
        while (j >= last) {
          let v = get_value(word[j], 50);
          if (v <= curval) {
            j -= 1;
            curval = v;
          } else {
            break;
          }
        }
        j += 1;
        let k = i + 1;
        curval = get_value(word[i], 50);
        while (k < n) {
          let v = get_value(word[k], 50);
          if (v == curval) {
            k += 1;
          } else {
            break;
          }
        }
        k -= 1;
        last = k + 1;
        i = k + 1;
        cut_points.push(j);
      } else {
        i += 1;
      }
    }
    cut_points.push(n);
    let syllables = []
    for (let k = 0; k < cut_points.length - 1; k++) {
      let i = cut_points[k];
      let j = cut_points[k + 1];
      syllables = syllables.concat(this._split_open(word.substring(i, j)));
    }
    return syllables
  }

  _normalize_syllable(syllable, do_stress) {
    let open = 0;
    for (let x of syllable) {
      if ('aeoAEO'.indexOf(x) !== -1) {
        open += 1;
      }
    }
    let has_open = (open > 0);
    let check_set = has_open ? 'aeo' : 'iu';
    let syllable0 = has_open ? syllable : rev(syllable);
    let res = '';
    let d = false;
    for (let x of syllable0) {
      if (check_set.indexOf(x) !== -1 && !d) {
        if (do_stress) {
          res += x.toUpperCase();
        } else {
          res += x;
        }
        d = true;
      } else if (x == 'i') {
        res += 'y';
      } else if (x == 'u') {
        res += 'w';
      } else {
        res += x;
      }
    }
    return has_open ? res : rev(res);
  }

  _normalize_syllables(syllables) {
    let res = [];
    for (let syl of syllables) {
      res.push(this._normalize_syllable(syl, false));
    }
    return res;
  }

  // E.g.
  //   "algebraico" -> ["al", "je", "brAy", "ko"]
  //   "algodón" -> ["al", "go", "dOn"]
  //   "algoritmo" -> ["al", "go", "rI", "tmo"]
  //   "alicate" -> ["a", "li", "kA", "te"]
  //   "alicate" -> ["a", "lye", "nI", "je", "na"]
  word_to_syllables(word) {
    let syllables = this._split_syllables(this._phonetics(word));
    let stressed = 0;
    for (let syl of syllables) {
      for (let x of syl) {
        if ('AEIOU'.indexOf(x) !== -1) {
          stressed += 1;
        }
      }
    }
    if (word.length === 0) {
      return [];
    }
    let last_letter = word[word.length - 1];
    if (syllables.length === 0) {
      return [];
    } else if (stressed >= 1) {
      return this._normalize_syllables(syllables);
    } else if (syllables.length == 1) {
      return [this._normalize_syllable(syllables[0], true)];
    } else if ('nsaeiou'.indexOf(last_letter) !== -1) {
      // Paroxytone
      let s0 = syllables.pop();
      let s1 = syllables.pop();
      let res = this._normalize_syllables(syllables);
      res.push(this._normalize_syllable(s1, true));
      res.push(this._normalize_syllable(s0, false));
      return res;
    } else {
      // Oxytone
      let s0 = syllables.pop();
      let res = this._normalize_syllables(syllables);
      res.push(this._normalize_syllable(s0, true));
      return res;
    }
  }

  // E.g.
  //   "algebraico" -> "aljebrAyko"
  //   "algodón" -> "algodOn"
  //   "algoritmo" -> "algorItmo"
  //   "alicate" -> "alikAte"
  //   "alicate" -> "alyenIjena"
  phonetics(word) {
    return this.word_to_syllables(word).join('');
  }

  // E.g.
  //   "algebraico" -> "ooxo"
  //   "algodón" -> "oox"
  //   "algoritmo" -> "ooxo"
  //   "alicate" -> "ooxo"
  //   "alienígena" -> "ooxoo"
  stress_pattern(word) {
    function is_stressed(syl) {
      for (let x of syl) {
        if ('AEIOU'.indexOf(x) !== -1) {
          return true;
        }
      }
      return false;
    }
    let pattern = [];
    let syllables = this.word_to_syllables(word);
    for (let syl of syllables) {
      pattern.push(is_stressed(syl) ? 'x' : 'o');
    }
    return pattern.join('');
  }

  // 0: oxytone; 1: paroxytone; 2: proparoxytone; ...
  // E.g.
  //   "algebraico" -> 1
  //   "algodón" -> 0
  //   "algoritmo" -> 1
  //   "alicate" -> 1
  //   "alienígena" -> 2
  stress_position(word) {
    let pattern = rev(this.stress_pattern(word));
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] == 'x') {
        return i;
      }
    }
    return 0;
  }

  // E.g.
  //   "amor", "", "es" -> "amores"
  //   "fértil", "", "es" -> "fértiles"
  //   "imagen", "", "es" -> "imágenes"
  //   "imágen", "es", "" -> "imagen"
  replace_suffix_preserving_stress(root, old_suffix, new_suffix) {
    let self = this;
    let stressed = {
      'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
      'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú',
    };
    let unstressed = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    };

    function all_stressed_variations(word) {
      let has_stress = false;
      for (let x of word) {
        if ('áéíóúÁÉÍÓÚ'.indexOf(x) !== -1) {
          has_stress = true;
          break;
        }
      }
      if (has_stress) {
        return [word];
      }
      let res = [];
      for (let i = 0; i < word.length; i++) {
        let x = word[i];
        if ('aeiouAEIOU'.indexOf(x) !== -1) {
          res.push(word.substring(0, i) + stressed[x]
                 + word.substring(i + 1, word.length));
        }
      }
      return res;
    }

    function explicit_stress(word) {
      let expected_stress_position = self.stress_position(word);
      for (let variation of all_stressed_variations(word)) {
        if (self.stress_position(variation) == expected_stress_position) {
          return variation;
        }
      }
      return word;
    }

    function unstress(word) {
      let res = [];
      for (let x of word) {
        if (x in unstressed) {
          res.push(unstressed[x]);
        } else {
          res.push(x);
        }
      }
      return res.join('');
    }

    function implicit_stress(word) {
      let pattern = self.stress_pattern(word);
      if (word.length === 0 || pattern.length === 0) {
        return word;
      } else if (pattern.length === 1) {
        return unstress(word);
      }
      let last_letter = word[word.length - 1];
      let p0 = pattern[pattern.length - 1];
      let p1 = pattern[pattern.length - 2];
      if (p0 === 'x' && 'nsaeiouAEIOU'.indexOf(last_letter) === -1) {
        // Implicit oxytone
        return unstress(word);
      } else if (p1 === 'x' && 'nsaeiouAEIOU'.indexOf(last_letter) !== -1) {
        // Implicit paroxytone
        return unstress(word);
      } else {
        return word;
      }
    }

    let e_root_old = explicit_stress(root + old_suffix);
    let e_root = e_root_old.substring(0, root.length);
    let e_root_new = e_root + new_suffix;
    return implicit_stress(e_root_new);
  }

  ends_in_vowel(word) {
    if (word.length === 0) {
      return false;
    }
    let last_letter = word[word.length - 1];
    return 'aeiouáéíóú'.indexOf(last_letter) !== -1;
  }

  _is_tonic(syl) {
    let res = '';
    for (let x of syl) {
      if ('AEIOU'.indexOf(x) !== -1) {
        return true;
      }
    }
    return false;
  }

  // E.g.
  //   "Faltar pudo su patria al grande Osuna." ->
  //   ["fal","tAr","pU","do","sU","pA","trya-Al","grAn","de-o","sU","na"]
  verse_syllables(verse0) {
    function unstress(syl) {
      let res = '';
      for (let x of syl) {
        if ('AEIOU'.indexOf(x) !== -1) {
          res += x.toLowerCase();
        } else {
          res += x;
        }
      }
      return res;
    }

    let verse = verse0.toLowerCase();
    for (let punctuation of ['.', ',', ';', ':', '(', ')',
                             '¡', '!', '¿', '?', '–']) {
      verse = replaceAll(verse, punctuation, ' ');
    }
    verse = verse.replace(/ +/g, ' ').trim();
    verse = verse.split(' ');
    // Fuse
    let res = [];
    let prev = '';
    let prevd = '';
    let scheme = '';
    for (let word of verse) {
      word = this.word_to_syllables(word);
      let isyl = 0;
      for (let syl of word) {
        let syld = syl;
        if (word.length === 1) {
          syld = unstress(syld);
        }
        isyl += 1;
        if (prev == '') {
          prev = syl;
          prevd = syld;
        } else {
          let a = prevd[prevd.length - 1];
          let b = syld[0];
          let fuse =
              (('aeiouAEO'.indexOf(a) !== -1 && 'aeiouAEO'.indexOf(b) !== -1)
               || ('iu'.indexOf(a) !== -1 && 'iU'.indexOf(b) !== -1)
               || ('aeo'.indexOf(a) !== -1 && 'iU'.indexOf(b) !== -1))
              && (isyl !== 2 || word.length !== 2);
          if (fuse) {
            syl = prev + '-' + syl;
            syld = prevd + '-' + syld;
            res.push(syl)
            scheme += this._is_tonic(syld) ? 'x' : 'o';
            prev = '';
            prevd = '';
          } else {
            res.push(prev);
            scheme += this._is_tonic(syld) ? 'x' : 'o';
            prev = syl;
            prevd = syld;
          }
        }
      }
    }
    res.push(prev);
    return res;
  }

  // E.g.
  //   "Faltar pudo su patria al grande Osuna." -> "oxxoxxxxoxo"
  verse_spanish_stress_pattern(verse) {
    let res = [];
    for (let syl of this.verse_syllables(verse)) {
      res.push(this._is_tonic(syl) ? 'x' : 'o');
    }
    return res.join('');
  }

  // E.g.
  //   "Faltar pudo su patria al grande Osuna." -> 13
  verse_naive_syllable_count(verse0) {
    let verse = verse0.toLowerCase();
    for (let punctuation of ['.', ',', ';', ':', '(', ')',
                             '¡', '!', '¿', '?']) {
      verse = replaceAll(verse, punctuation, ' ');
    }
    verse = verse.replace(/ +/g, ' ').trim();
    verse = verse.split(' ');
    let count = 0;
    for (let word of verse) {
      count += this.stress_pattern(word).length;
    }
    return count;
  }

  // E.g.
  //   "de el águila" -> "del águila"
  apply_contractions(verse) {
    let self = this;
    function tonic_a(word) {
      let syls = self.word_to_syllables(word);
      return syls.length > 0
          && syls[0].length > 0
          && syls[0][0] === 'A';
    }
    let res = [];
    let words = verse.split(' ');
    let n = words.length;
    let next = '';
    for (let i = n - 1; i >= 0; i--) {
      let word = words[i];
      // Feminine article followed by tonic 'a'
      if (word == 'la' && tonic_a(next)) {
        word = 'el';
      } else if (word == 'una' && tonic_a(next)) {
        word = 'un';
      }
      // Contractions
      if (word == 'de' && next == 'el') {
        res.shift();
        res.unshift('del');
      } else if (word == 'a' && next == 'el') {
        res.shift();
        res.unshift('al');
      } else {
        res.unshift(word);
      }
      next = res[0];
    }
    return res.join(' ');
  }

  fix_ortotypography(lines) {
    function is_f_punctuation(x) {
      return ['.', '!','?'].indexOf(x) !== -1;

    }
    function is_r_punctuation(x) {
      return ['.', ',', ';', ':',  ')', '!','?'].indexOf(x) !== -1;

    }
    function is_l_punctuation(x) {
      return ['(','¡', '¿'].indexOf(x) !== -1;
    }
    let res = [];
    let prev = '';
    let cap = true;
    for (let line of lines) {
      res.push('');
      for (let word of line.split(' ')) {
        if (is_r_punctuation(word)) {
          if (res[res.length - 1] === '' && res.length > 1) {
            res[res.length - 2] += word;
          } else {
            res[res.length - 1] += word;
          }
          cap = is_f_punctuation(word);
        } else if (is_l_punctuation(word)) {
          if (res[res.length - 1] === '') {
            res[res.length - 1] += word;
          } else {
            res[res.length - 1] += ' ' + word;
          }
          // cap stays unchanged
        } else {
          if (cap && word.length > 0) {
            word = word[0].toUpperCase() + word.substring(1, word.length);
          }
          if (res[res.length - 1] === '' || is_l_punctuation(prev)) {
            res[res.length - 1] += word;
          } else {
            res[res.length - 1] += ' ' + word;
          }
          cap = false;
        }
        prev = word;
      }
    }
    return res;
  }

}

