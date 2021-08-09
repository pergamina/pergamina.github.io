
/* Derivational morphology */

const GENDER_M = 'm';        // masculino
const GENDER_F = 'f';        // femenino
const NUMBER_S = 's';        // singular
const NUMBER_P = 'p';        // plural
const TYPE_VT = 'vt';        // transitivo
const TYPE_VI = 'vi';        // intransitivo
const TYPE_VPRNL = 'vprnl';  // pronominal
const TENSE_PRETP = 'pretp'; // pretérito perfecto simple
const TENSE_PRETI = 'preti'; // pretérito imperfecto
const TENSE_PRES = 'pres';   // presente
const PERSON_1 = '1';        // primera persona
const PERSON_2 = '2';        // segunda persona
const PERSON_3 = '3';        // tercera persona

// Base class for words
class Word {

  constructor(form) {
    this._form = form;
  }

  is_proper_noun() {
    return false;
  }

  is_noun() {
    return false;
  }

  is_adjective() {
    return false;
  }

  is_verb() {
    return false;
  }

  form() {
    return this._form;
  }

  toString() {
    return this._form + ' ' + this._pos + ' [unclassified]';
  }
}

class ProperNoun extends Word {

  constructor(root, gender) {
    super(root);
    this._root = root;
    this._gender = gender;
  }

  is_proper_noun() {
    return true;
  }

  gender() {
    return this._gender;
  }

  text() {
    return this._root;
  }

  toString() {
    return this._root + ' NPROP(' + this._gender + ')';
  }

}

class Noun extends Word {

  constructor(root, form, gender, number) {
    super(form);
    this._root = root;
    this._gender = gender;
    this._number = number;
  }

  is_noun() {
    return true;
  }

  gender() {
    return this._gender;
  }

  number() {
    return this._number;
  }

  toString() {
    return this._form + ' N(' + this._gender + this._number + ')';
  }

}

class Adjective extends Word {

  constructor(root, form, gender, number) {
    super(form);
    this._root = root;
    this._gender = gender;
    this._number = number;
  }

  is_adjective() {
    return true;
  }

  gender() {
    return this._gender;
  }

  number() {
    return this._number;
  }

  toString() {
    return this._form + ' ADJ(' + this._gender + this._number + ')';
  }

}

class Verb extends Word {

  constructor(root, form, type, tense, person, number) {
    super(form);
    this._root = root;
    this._type = type;
    this._tense = tense;
    this._person = person;
    this._number = number;
  }

  is_verb() {
    return true;
  }

  type() {
    return this._type;
  }

  toString() {
    return this._form
         + ' V(' + this._type
         + '.' + this._tense
         + '.' + this._person + this._number
         + ')';
  }

}

const IRREGULAR_VERBS = {
  'actuar': {
    'pres.1s': 'actúo',
    'pres.3s': 'actúa',
    'pres.3p': 'actúan',
  },
  'advertir': {
    'pres.1s': 'advierto',
    'pres.3s': 'advierte',
    'pres.3p': 'advierten',
    'pretp.3s': 'advirtió',
    'pretp.3p': 'advirtieron',
  },
  'almorzar': {
    'pres.1s': 'almuerzo',
    'pres.3s': 'almuerza',
    'pres.3p': 'almuerzan',
  },
  'amanecer': {
    'pres.1s': 'amanezco',
  },
  'andar': {
    'pretp.1s': 'anduve',
    'pretp.2s': 'anduviste',
    'pretp.3s': 'anduvo',
    'pretp.1p': 'anduvimos',
    'pretp.3p': 'anduvieron',
  },
  'anochecer': {
    'pres.1s': 'anochezco',
  },
  'apostar': {
    'pres.1s': 'apuesto',
    'pres.3s': 'apuesta',
    'pres.3p': 'apuestan',
  },
  'apretar': {
    'pres.1s': 'aprieto',
    'pres.3s': 'aprieta',
    'pres.3p': 'aprietan',
  },
  'aprobar': {
    'pres.1s': 'apruebo',
    'pres.3s': 'aprueba',
    'pres.3p': 'aprueban',
  },
  'ascender': {
    'pres.1s': 'asciendo',
    'pres.3s': 'asciende',
    'pres.3p': 'ascienden',
  },
  'atardecer': {
    'pres.1s': 'atardezco',
  },
  'caer': {
    'pres.1s': 'caigo',
    'pretp.1s': 'caí',
    'pretp.2s': 'caíste',
    'pretp.3s': 'cayó',
    'pretp.1p': 'caímos',
    'pretp.3p': 'cayeron',
  },
  'calentar': {
    'pres.1s': 'caliento',
    'pres.3s': 'calienta',
    'pres.3p': 'calientan',
  },
  'coger': {
    'pres.1s': 'cojo',
  },
  'comenzar': {
    'pres.1s': 'comienzo',
    'pres.3s': 'comienza',
    'pres.3p': 'comienzan',
  },
  'competir': {
    'pres.1s': 'compito',
    'pres.3s': 'compite',
    'pres.3p': 'compiten',
    'pretp.3s': 'compitió',
    'pretp.3p': 'compitieron',
  },
  'comprobar': {
    'pres.1s': 'compruebo',
    'pres.3s': 'comprueba',
    'pres.3p': 'comprueban',
  },
  'componer': {
    'pres.1s': 'compongo',
    'pretp.1s': 'compuse',
    'pretp.2s': 'compusiste',
    'pretp.3s': 'compuso',
    'pretp.1p': 'compusimos',
    'pretp.3p': 'compusieron',
  },
  'concebir': {
    'pres.1s': 'concibo',
    'pres.3s': 'concibe',
    'pres.3p': 'conciben',
    'pretp.3s': 'concibió',
    'pretp.3p': 'concibieron',
  },
  'concluir': {
    'pres.1s': 'concluyo',
    'pres.3s': 'concluye',
    'pres.3p': 'concluyen',
    'pretp.3s': 'concluyó',
    'pretp.3p': 'concluyeron',
  },
  'conducir': {
    'pres.1s': 'conduzco',
    'pretp.1s': 'conduje',
    'pretp.2s': 'condujiste',
    'pretp.3s': 'condujo',
    'pretp.1p': 'condujimos',
    'pretp.3p': 'condujeron',
  },
  'construir': {
    'pres.1s': 'construyo',
    'pres.3s': 'construye',
    'pres.3p': 'construyen',
    'pretp.3s': 'construyó',
    'pretp.3p': 'construyeron',
  },
  'contar': {
    'pres.1s': 'cuento',
    'pres.3s': 'cuenta',
    'pres.3p': 'cuentan',
  },
  'confesar': {
    'pres.1s': 'confieso',
    'pres.3s': 'confiesa',
    'pres.3p': 'confiesan',
  },
  'continuar': {
    'pres.1s': 'continúo',
    'pres.3s': 'continúa',
    'pres.3p': 'continúan',
  },
  'corregir': {
    'pres.1s': 'corrijo',
    'pres.3s': 'corrige',
    'pres.3p': 'corrigen',
    'pretp.3s': 'corrigió',
    'pretp.3p': 'corrigieron',
  },
  'crecer': {
    'pres.1s': 'crezco',
  },
  'decir': {
    'pres.1s': 'digo',
    'pres.3s': 'dice',
    'pres.3p': 'dicen',
    'pretp.1s': 'dije',
    'pretp.2s': 'dijiste',
    'pretp.1p': 'dijimos',
    'pretp.3s': 'dijo',
    'pretp.3p': 'dijeron',
  },
  'decrecer': {
    'pres.1s': 'decrezco',
  },
  'desaprobar': {
    'pres.1s': 'desapruebo',
    'pres.3s': 'desaprueba',
    'pres.3p': 'desaprueban',
  },
  'descender': {
    'pres.1s': 'desciendo',
    'pres.3s': 'desciende',
    'pres.3p': 'descienden',
  },
  'desvestir': {
    'pres.1s': 'desvisto',
    'pres.3s': 'desviste',
    'pres.3p': 'desvisten',
    'pretp.3s': 'desvistió',
    'pretp.3p': 'desvistieron',
  },
  'detener': {
    'pres.1s': 'detengo',
    'pres.3s': 'detiene',
    'pres.3p': 'detienen',
    'pretp.1s': 'detuve',
    'pretp.2s': 'detuviste',
    'pretp.3s': 'detuvo',
    'pretp.1p': 'detuvimos',
    'pretp.3p': 'detuvieron',
  },
  'disminuir': {
    'pres.1s': 'disminuyo',
    'pres.3s': 'disminuye',
    'pres.3p': 'disminuyen',
    'pretp.3s': 'disminuyó',
    'pretp.3p': 'disminuyeron',
  },
  'divertir': {
    'pres.1s': 'divierto',
    'pres.3s': 'divierte',
    'pres.3p': 'divierten',
    'pretp.3s': 'divirtió',
    'pretp.3p': 'divirtieron',
  },
  'dormir': {
    'pres.1s': 'duermo',
    'pres.3s': 'duerme',
    'pres.3p': 'duermen',
    'pretp.3s': 'durmió',
    'pretp.3p': 'durmieron',
  },
  'encender': {
    'pres.1s': 'enciendo',
    'pres.3s': 'enciende',
    'pres.3p': 'encienden',
  },
  'encerrar': {
    'pres.1s': 'encierro',
    'pres.3s': 'encierra',
    'pres.3p': 'encierran',
  },
  'enorgullecer': {
    'pres.1s': 'enorgullezco',
  },
  'enriquecer': {
    'pres.1s': 'enriquezco',
  },
  'enrojecer': {
    'pres.1s': 'enrojezco',
  },
  'ensombrecer': {
    'pres.1s': 'ensombrezco',
  },
  'envejecer': {
    'pres.1s': 'envejezco',
  },
  'enviar': {
    'pres.1s': 'envío',
    'pres.3s': 'envía',
    'pres.3p': 'envían',
  },
  'errar': {
    'pres.1s': 'yerro',
    'pres.3s': 'yerra',
    'pres.3p': 'yerran',
  },
  'esquiar': {
    'pres.1s': 'esquío',
    'pres.3s': 'esquía',
    'pres.3p': 'esquían',
  },
  'fallecer': {
    'pres.1s': 'fallezco',
  },
  'florecer': {
    'pres.1s': 'florezco',
  },
  'freír': {
    'pres.1s': 'frío',
    'pres.3s': 'fríe',
    'pres.1p': 'freímos',
    'pres.3p': 'fríen',
    'pretp.2s': 'freíste',
    'pretp.3s': 'frio',
    'pretp.1p': 'freímos',
    'pretp.3p': 'frieron',
  },
  'gobernar': {
    'pres.1s': 'gobierno',
    'pres.3s': 'gobierna',
    'pres.3p': 'gobiernan',
  },
  'graduar': {
    'pres.1s': 'gradúo',
    'pres.3s': 'gradúa',
    'pres.3p': 'gradúan',
  },
  'hervir': {
    'pres.1s': 'hiervo',
    'pres.3s': 'hierve',
    'pres.3p': 'hierven',
    'pretp.3s': 'hirvió',
    'pretp.3p': 'hirvieron',
  },
  'inquirir': {
    'pres.1s': 'inquiero',
    'pres.3s': 'inquiere',
    'pres.3p': 'inquieren',
  },
  'invertir': {
    'pres.1s': 'invierto',
    'pres.3s': 'invierte',
    'pres.3p': 'invierten',
    'pretp.3s': 'invirtió',
    'pretp.3p': 'invirtieron',
  },
  'ir': {
    'pres.1s': 'voy',
    'pres.2s': 'vas',
    'pres.3s': 'va',
    'pres.1p': 'vamos',
    'pres.3p': 'van',
    'pretp.1s': 'fui',
    'pretp.2s': 'fuiste',
    'pretp.3s': 'fue',
    'pretp.1p': 'fuimos',
    'pretp.3p': 'fueron',
    'preti.1s': 'iba',
    'preti.2s': 'ibas',
    'preti.3s': 'iba',
    'preti.1p': 'íbamos',
    'preti.3p': 'iban',
  },
  'jugar': {
    'pres.1s': 'juego',
    'pres.3s': 'juega',
    'pres.3p': 'juegan',
  },
  'leer': {
    'pretp.2s': 'leíste',
    'pretp.3s': 'leyó',
    'pretp.1p': 'leímos',
    'pretp.3p': 'leyeron',
  },
  'llover': {
    'pres.1s': 'lluevo',
    'pres.3s': 'llueve',
    'pres.3p': 'llueven',
  },
  'maldecir': {
    'pres.1s': 'maldigo',
    'pres.3s': 'maldice',
    'pres.3p': 'maldicen',
    'pretp.1s': 'maldije',
    'pretp.2s': 'maldijiste',
    'pretp.1p': 'maldijimos',
    'pretp.3s': 'maldijo',
    'pretp.3p': 'maldijeron',
  },
  'maullar': {
    'pres.1s': 'maúllo',
    'pres.3s': 'maúlla',
    'pres.3p': 'maúllan',
  },
  'medir': {
    'pres.1s': 'mido',
    'pres.3s': 'mide',
    'pres.3p': 'miden',
    'pretp.3s': 'midió',
    'pretp.3p': 'midieron',
  },
  'merendar': {
    'pres.1s': 'meriendo',
    'pres.3s': 'merienda',
    'pres.3p': 'meriendan',
  },
  'morder': {
    'pres.1s': 'muerdo',
    'pres.3s': 'muerde',
    'pres.3p': 'muerden',
  },
  'morir': {
    'pres.1s': 'muero',
    'pres.3s': 'muere',
    'pres.3p': 'mueren',
    'pretp.3s': 'murió',
    'pretp.3p': 'murieron',
  },
  'nacer': {
    'pres.1s': 'nazco',
  },
  'negar': {
    'pres.1s': 'niego',
    'pres.3s': 'niega',
    'pres.3p': 'niegan',
  },
  'nevar': {
    'pres.1s': 'nievo',
    'pres.3s': 'nieva',
    'pres.3p': 'nievan',
  },
  'oir': {
    'pres.1s': 'oigo',
    'pres.3s': 'oye',
    'pres.1p': 'oímos',
    'pres.3p': 'oyen',
    'pretp.2s': 'oíste',
    'pretp.3s': 'oyó',
    'pretp.1p': 'oímos',
    'pretp.3p': 'oyeron',
  },
  'oler': {
    'pres.1s': 'huelo',
    'pres.3s': 'huele',
    'pres.3p': 'huelen',
  },
  'organizar': {
    'pretp.1s': 'organicé',
  },
  'oscurecer': {
    'pres.1s': 'oscurezco',
  },
  'pagar': {
    'pretp.1s': 'pagué',
  },
  'pensar': {
    'pres.1s': 'pienso',
    'pres.3s': 'piensa',
    'pres.3p': 'piensan',
  },
  'perder': {
    'pres.1s': 'pierdo',
    'pres.3s': 'pierde',
    'pres.3p': 'pierden',
  },
  'piar': {
    'pres.1s': 'pío',
    'pres.3s': 'pía',
    'pres.3p': 'pían',
  },
  'predecir': {
    'pres.1s': 'predigo',
    'pres.3s': 'predice',
    'pres.3p': 'predicen',
    'pretp.1s': 'predije',
    'pretp.2s': 'predijiste',
    'pretp.1p': 'predijimos',
    'pretp.3s': 'predijo',
    'pretp.3p': 'predijeron',
  },
  'probar': {
    'pres.1s': 'pruebo',
    'pres.3s': 'prueba',
    'pres.3p': 'prueban',
  },
  'proteger': {
    'pres.1s': 'protejo',
  },
  'puntuar': {
    'pres.1s': 'puntúo',
    'pres.3s': 'puntúa',
    'pres.3p': 'puntúan',
  },
  'quebrar': {
    'pres.1s': 'quiebro',
    'pres.3s': 'quiebra',
    'pres.3p': 'quiebran',
  },
  'querer': {
    'pres.1s': 'quiero',
    'pres.3s': 'quiere',
    'pres.3p': 'quieren',
    'pretp.1s': 'quise',
    'pretp.2s': 'quisiste',
    'pretp.3s': 'quiso',
    'pretp.1p': 'quisimos',
    'pretp.3p': 'quisieron',
  },
  'recordar': {
    'pres.1s': 'recuerdo',
    'pres.3s': 'recuerda',
    'pres.3p': 'recuerdan',
  },
  'reducir': {
    'pres.1s': 'reduzco',
    'pretp.1s': 'reduje',
    'pretp.2s': 'redujiste',
    'pretp.3s': 'redujo',
    'pretp.1p': 'redujimos',
    'pretp.3p': 'redujeron',
  },
  'reforzar': {
    'pres.1s': 'refuerzo',
    'pres.3s': 'refuerza',
    'pres.3p': 'refuerzan',
  },
  'regar': {
    'pres.1s': 'riego',
    'pres.3s': 'riega',
    'pres.3p': 'riegan',
  },
  'reír': {
    'pres.1s': 'río',
    'pres.3s': 'ríe',
    'pres.1p': 'reímos',
    'pres.3p': 'ríen',
    'pretp.2s': 'reíste',
    'pretp.3s': 'rio',
    'pretp.1p': 'reímos',
    'pretp.3p': 'rieron',
  },
  'repetir': {
    'pres.1s': 'repito',
    'pres.3s': 'repite',
    'pres.3p': 'repiten',
    'pretp.3s': 'repitió',
    'pretp.3p': 'repitieron',
  },
  'reproducir': {
    'pres.1s': 'reproduzco',
    'pretp.1s': 'reproduje',
    'pretp.2s': 'reprodujiste',
    'pretp.3s': 'reprodujo',
    'pretp.1p': 'reprodujimos',
    'pretp.3p': 'reprodujeron',
  },
  'rodar': {
    'pres.1s': 'ruedo',
    'pres.3s': 'rueda',
    'pres.3p': 'ruedan',
  },
  'roer': {
    'pres.1s': 'roigo',
    'pretp.2s': 'roíste',
    'pretp.3s': 'royó',
    'pretp.1p': 'roímos',
    'pretp.3p': 'royeron',
  },
  'salir': {
    'pres.1s': 'salgo',
  },
  'seguir': {
    'pres.1s': 'sigo',
    'pres.3s': 'sigue',
    'pres.3p': 'siguen',
    'pretp.3s': 'siguió',
    'pretp.3p': 'siguieron',
  },
  'sembrar': {
    'pres.1s': 'siembro',
    'pres.3s': 'siembra',
    'pres.3p': 'siembran',
  },
  'servir': {
    'pres.1s': 'sirvo',
    'pres.3s': 'sirve',
    'pres.3p': 'sirven',
    'pretp.3s': 'sirvió',
    'pretp.3p': 'sirvieron',
  },
  'sonar': {
    'pres.1s': 'sueno',
    'pres.3s': 'suena',
    'pres.3p': 'suenan',
  },
  'sonreír': {
    'pres.1s': 'sonrío',
    'pres.3s': 'sonríe',
    'pres.1p': 'sonreímos',
    'pres.3p': 'sonríen',
    'pretp.2s': 'sonreíste',
    'pretp.3s': 'sonrió',
    'pretp.1p': 'sonreímos',
    'pretp.3p': 'sonrieron',
  },
  'soñar': {
    'pres.1s': 'sueño',
    'pres.3s': 'sueña',
    'pres.3p': 'sueñan',
  },
  'temblar': {
    'pres.1s': 'tiemblo',
    'pres.3s': 'tiembla',
    'pres.3p': 'tiemblan',
  },
  'transferir': {
    'pres.1s': 'transfiero',
    'pres.3s': 'transfiere',
    'pres.3p': 'transfieren',
    'pretp.3s': 'transfirió',
    'pretp.3p': 'transfirieron',
  },
  'tronar': {
    'pres.1s': 'trueno',
    'pres.3s': 'truena',
    'pres.3p': 'truenan',
  },
  'ver': {
    'pres.1s': 'veo',
    'pres.2s': 'ves',
    'pretp.1s': 'vi',
    'pretp.3s': 'vio',
    'preti.1s': 'veía',
    'preti.2s': 'veías',
    'preti.3s': 'veía',
    'preti.1p': 'veíamos',
    'preti.3p': 'veían',
  },
  'vestir': {
    'pres.1s': 'visto',
    'pres.3s': 'viste',
    'pres.3p': 'visten',
    'pretp.3s': 'vistió',
    'pretp.3p': 'vistieron',
  },
  'volar': {
    'pres.1s': 'vuelo',
    'pres.3s': 'vuela',
    'pres.3p': 'vuelan',
  },
  'volver': {
    'pres.1s': 'vuelvo',
    'pres.3s': 'vuelve',
    'pres.3p': 'vuelven',
  },
  'zambullir': {
    'pretp.3s': 'zambulló',
    'pretp.3p': 'zambulleron',
  },
};

class LanguageMorphology {

  constructor() {
    this._pos_per_word = this._build_pos_per_word();
    this._phonetics = new LanguagePhonetics();
  }

  _build_pos_per_word() {
    // Build table (part of speech per word)
    let table = {};
    for (let key in LEXICON) {
      for (let concept of LEXICON[key]) {
        let word = concept.word();
        let pos = concept.pos();
        if (!(word in table)) {
          table[word] = {};
        }
        table[word][pos] = 1;
      }
    }
    return table;
  }

  parts_of_speech(word) {
    if (!(word in this._pos_per_word)) {
      return [];
    } else {
      let ps = [];
      for (let p in this._pos_per_word[word]) {
        ps.push(p);
      }
      return ps;
    }
  }

  has_pos(word, pos) {
    return this.parts_of_speech(word).indexOf(pos) !== -1;
  }

  proper_noun_variations(word, gender) {
    let res = [];
    if ((gender == GENDER_M && this.has_pos(word, 'NMPROP'))
        || (gender == GENDER_F && this.has_pos(word, 'NFPROP'))){
      res.push(this.proper_noun(word, gender));
    }
    return res;
  }

  noun_variations(word, gender, number) {
    let res = [];
    if ((gender == GENDER_M && this.has_pos(word, 'NM'))
        || (gender == GENDER_F && this.has_pos(word, 'NF'))){
      res.push(this.noun(word, gender, number));
    }
    return res;
  }

  adjective_variations(word, gender, number) {
    let res = [];
    if (this.has_pos(word, 'ADJ')) {
      res.push(this.adjective(word, gender, number));
    }
    return res;
  }

  verb_variations(word, type, tense, person, number) {
    let res = [];
    if (type == TYPE_VT && this.has_pos(word, 'VT')) {
      res.push(this.verb(word, TYPE_VT, tense, person, number));
    } else if (type == TYPE_VI && this.has_pos(word, 'VI')) {
      res.push(this.verb(word, TYPE_VI, tense, person, number));
    } else if (type == TYPE_VPRNL && this.has_pos(word, 'VPRNL')) {
      if (!word.endsWith('se')) {
        throw Error("Malformed VPRNL: " + word + ".");
      }
      let verb = word.substr(0, word.length - 2);
      res.push(this.verb(verb, TYPE_VPRNL, tense, person, number));
    }
    return res;
  }

  variations(word) {
    let res = [];
    for (let pos of this.parts_of_speech(word)) {
      if (pos === 'ADJ') {
        res.push(this.adjective(word, GENDER_M, NUMBER_S));
        res.push(this.adjective(word, GENDER_M, NUMBER_P));
        res.push(this.adjective(word, GENDER_F, NUMBER_S));
        res.push(this.adjective(word, GENDER_F, NUMBER_P));
      } else if (pos === 'NMPROP') {
        res.push(this.proper_noun(word, GENDER_M));
      } else if (pos === 'NFPROP') {
        res.push(this.proper_noun(word, GENDER_F));
      } else if (pos === 'NM') {
        res.push(this.noun(word, GENDER_M, NUMBER_S));
        res.push(this.noun(word, GENDER_M, NUMBER_P));
      } else if (pos === 'NF') {
        res.push(this.noun(word, GENDER_F, NUMBER_S));
        res.push(this.noun(word, GENDER_F, NUMBER_P));
      } else if (pos === 'VT') {
        for (let tense of [TENSE_PRES, TENSE_PRETP, TENSE_PRETI]) {
          for (let person of [PERSON_1, PERSON_2, PERSON_3]) {
            for (let number of [NUMBER_S, NUMBER_P]) {
              res.push(this.verb(word, TYPE_VT, tense, person, number));
            }
          }
        }
      } else if (pos === 'VI') {
        for (let tense of [TENSE_PRES, TENSE_PRETP, TENSE_PRETI]) {
          for (let person of [PERSON_1, PERSON_2, PERSON_3]) {
            for (let number of [NUMBER_S, NUMBER_P]) {
              res.push(this.verb(word, TYPE_VI, tense, person, number));
            }
          }
        }
      } else if (pos === 'VPRNL') {
        if (!word.endsWith('se')) {
          throw Error("Malformed VPRNL: " + word + ".");
        }
        let verb = word.substr(0, word.length - 2);
        for (let tense of [TENSE_PRES, TENSE_PRETP, TENSE_PRETI]) {
          for (let person of [PERSON_1, PERSON_2, PERSON_3]) {
            for (let number of [NUMBER_S, NUMBER_P]) {
              res.push(this.verb(verb, TYPE_VPRNL, tense, person, number));
            }
          }
        }
      } else {
        res.push(new Word(word, pos));
      }
    }
    return res;
  }

  _sufrepl(a, b, c) {
    return this._phonetics.replace_suffix_preserving_stress(a, b, c);
  }

  /* Nominal morphology */

  proper_noun(root, gender) {
    return new ProperNoun(root, gender);
  }

  noun(root, gender, number) {
    let form = this._noun_form(root, gender, number);
    return new Noun(root, form, gender, number);
  }

  _noun_form(root, gender, number) {
    if (gender === GENDER_M && number === NUMBER_S) {
      return this._noun_ms(root);
    } else if (gender === GENDER_M && number === NUMBER_P) {
      return this._noun_mp(root);
    } else if (gender === GENDER_F && number === NUMBER_S) {
      return this._noun_fs(root);
    } else if (gender === GENDER_F && number === NUMBER_P) {
      return this._noun_fp(root);
    } else {
      throw Error("Invalid gender/number combination for noun."); 
    }
  }

  _pluralize(root) {
    if (root.endsWith('í') || root.endsWith('ú')) {
      return root + 'es';
    } else if (root.endsWith('ío')
            || root.endsWith('úo')
            || root.endsWith('ía')
            || root.endsWith('úa')) {
      return root + 's';
    } else if (root.endsWith('s')) {
      return root;
    } else if (this._phonetics.ends_in_vowel(root)) {
      return this._sufrepl(root, '', 's');
    } else if (root.endsWith('z')) {
      return this._sufrepl(root.substring(0, root.length - 1), 'z', 'ces');
    } else {
      return this._sufrepl(root, '', 'es');
    }
  }

  _pluralize_m(root) {
    return this._pluralize(root);
  }

  _pluralize_f(root) {
    return this._pluralize(root);
  }

  _noun_ms(root) {
    return root;
  }

  _noun_mp(root) {
    let exceptions = {
      'CD': 'CDs', 'DVD': 'DVDs', 'arcoíris': 'arcoíris',
      'arco iris': 'arcos iris', 'baúl': 'baúles', 'bloc': 'blocs',
      'bowling': 'bowlings', 'cabernet': 'cabernets', 'cactus': 'cactus',
      'chop': 'chops', 'clip': 'clips', 'copyright': 'copyrights',
      'compact': 'compacts', 'diskette': 'diskettes',
      'dúo': 'dúos', 'fagot': 'fagots', 'gay': 'gays', 'gintonic': 'gintonics',
      'goblin': 'goblins', 'golf': 'golfs', 'hacker': 'hackers',
      'jazz': 'jazzes', 'jean': 'jeans', 'joystick': 'joysticks',
      'laúd': 'laúdes', 'luthier': 'luthiers',
      'mal humor': 'malos humores', 'malbec': 'malbecs',
      'mamut': 'mamuts', 'merlot': 'merlots',
      'pis': 'pises', 'pool': 'pools', 'rock': 'rocks',
      'rugbier': 'rugbiers', 'rugby': 'rugbies', 'snowboard': 'snowboards',
      'té': 'tés', 'whisky': 'whiskies', 'zenit': 'zenits',
      'escocés': 'escoceses', 'francés': 'franceses', 'galés': 'galeses',
      'inglés': 'ingleses', 'irlandés': 'irlandeses', 'japonés': 'japoneses',
      'interés': 'intereses', 'compás': 'compases',
    };
    if (root in exceptions) {
      return exceptions[root];
    } else if (root.indexOf(' ') !== -1) {
      let parts = root.split(' ');
      if (parts.length >= 3 && parts[1] == 'de') {
        return [this._pluralize_m(parts[0]), 'de', parts[2]].join(' ');
      } else {
        let res = [];
        for (let part of parts) {
          res.push(this._pluralize_m(part));
        }
        return res.join(' ');
      }
    } else {
      return this._pluralize_m(root);
    }
  }

  _noun_fs(root) {
    return root;
  }

  _noun_fp(root) {
    let exceptions = {
      'rugbier': 'rugbiers',
    };
    if (root in exceptions) {
      return exceptions[root];
    } else if (root.indexOf(' ') !== -1) {
      let parts = root.split(' ');
      if (parts.length >= 3 && parts[1] == 'de') {
        return [this._pluralize_f(parts[0]), 'de', parts[2]].join(' ');
      } else {
        let res = [];
        for (let part of parts) {
          res.push(this._pluralize_f(part));
        }
        return res.join(' ');
      }
    } else {
      return this._pluralize_f(root);
    }
  }

  /* Adjectival morphology */

  adjective(root, gender, number) {
    let form = this._adjective_form(root, gender, number);
    return new Adjective(root, form, gender, number);
  }

  _adjective_form(root, gender, number) {
    if (gender === GENDER_M && number === NUMBER_S) {
      return this._adjective_ms(root);
    } else if (gender === GENDER_M && number === NUMBER_P) {
      return this._adjective_mp(root);
    } else if (gender === GENDER_F && number === NUMBER_S) {
      return this._adjective_fs(root);
    } else if (gender === GENDER_F && number === NUMBER_P) {
      return this._adjective_fp(root);
    } else {
      throw Error("Invalid gender/number combination for adjective."); 
    }
  }

  _adjective_ms(root) {
    return root;
  }

  _adjective_mp(root) {
    let exceptions = {
      'escocés': 'escoceses', 'francés': 'franceses', 'galés': 'galeses',
      'gratis': 'gratis', 'hindú': 'hindúes', 'inglés': 'ingleses',
      'irlandés': 'irlandeses', 'japonés': 'japoneses',
    };
    if (root in exceptions) {
      return exceptions[root];
    } else {
      return this._pluralize_m(root);
    }
  }

  _adjective_fs(root) {
    let exceptions = {
      'alemán': 'alemana', 'conductor': 'conductora', 'dormilón': 'dormilona',
      'escocés': 'escocesa', 'español': 'española', 'francés': 'francesa',
      'galés': 'galesa', 'gratis': 'gratis', 'inglés': 'inglesa',
      'invasor': 'invasora', 'irlandés': 'irlandesa', 'japonés': 'japonesa',
      'parlanchín': 'parlanchina', 'soprano': 'soprano', 'tenor': 'soprano',
      'trabajador': 'trabajadora',
    };
    if (root in exceptions) {
      return exceptions[root];
    } else if (root.endsWith('ío')) {
      return root.substring(0, root.length - 1) + 'a'
    } else if (root.endsWith('o')) {
      return this._sufrepl(root.substring(0, root.length - 1), 'o', 'a');
    } else {
      return root;
    }
  }

  _adjective_fp(root) {
    let exceptions = {
      'alemán': 'alemanas', 'conductor': 'conductoras',
      'dormilón': 'dormilonas', 'escocés': 'escocesas', 'español': 'españolas',
      'francés': 'francesas', 'galés': 'galesas', 'gratis': 'gratis',
      'hindú': 'hindúes', 'inglés': 'inglesas', 'invasor': 'invasoras',
      'irlandés': 'irlandesas', 'japonés': 'japonesas',
      'parlanchín': 'parlanchinas', 'soprano': 'sopranos', 'tenor': 'sopranos',
      'trabajador': 'trabajadoras',
    };
    if (root in exceptions) {
      return exceptions[root];
    } else if (root.endsWith('ío')) {
      return root.substring(0, root.length - 1) + 'as'
    } else if (root.endsWith('o')) {
      return this._sufrepl(root.substring(0, root.length - 1), 'o', 'as');
    } else if (this._phonetics.ends_in_vowel(root)) {
      return this._sufrepl(root, '', 's');
    } else if (root.endsWith('z')) {
      return this._sufrepl(root.substring(0, root.length - 1), 'z', 'ces');
    } else {
      return this._sufrepl(root, '', 'es');
    }
  }

  /* Verbal morphology */

  verb(root, type, tense, person, number) {
    let form = this._verb_form(root, type, tense, person, number);
    return new Verb(root, form, type, tense, person, number);
  }

  _verb_form(root, type, tense, person, number) {
    if (person === PERSON_2 && number == NUMBER_P) {
      // ustedes ~ ellos
      person = PERSON_3;
    }
    let form = this._verb_conjugations(root)[
                 this._verb_key(tense, person, number)
               ];
    if (type === TYPE_VPRNL) {
      let reflexive_pronouns = {
        '1s': 'me',
        '2s': 'te',
        '3s': 'se',
        '1p': 'nos',
        '2p': 'se',
        '3p': 'se',
      };
      let pronoun = reflexive_pronouns[person + number];
      return pronoun + ' ' + form;
    } else {
      return form;
    }
  }

  _verb_key(tense, person, number) {
    return tense + '.' + person + number;
  }

  _verb_conjugations(verb) {
    if (verb.length < 2) {
      throw Error("Invalid verb (too short)."); 
    }
    let root = verb.substring(0, verb.length - 2);
    let declination = verb.substring(verb.length - 2, verb.length);
    let table;
    if (declination == 'ar') {
      table = {
        'pres.1s': root + 'o',
        'pres.2s': root + 'ás',
        'pres.3s': root + 'a',
        'pres.1p': root + 'amos',
        'pres.3p': root + 'an',
        'pretp.1s': root + 'é',
        'pretp.2s': root + 'aste',
        'pretp.3s': root + 'ó',
        'pretp.1p': root + 'amos',
        'pretp.3p': root + 'aron',
        'preti.1s': root + 'aba',
        'preti.2s': root + 'abas',
        'preti.3s': root + 'aba',
        'preti.1p': root + 'ábamos',
        'preti.3p': root + 'aban',
      };
      if (verb.endsWith('car')) {
        table['pretp.1s'] = verb.substring(0, verb.length - 3) + 'qué';
      } else if (verb.endsWith('gar')) {
        table['pretp.1s'] = verb.substring(0, verb.length - 3) + 'gué';
      } else if (verb.endsWith('zar')) {
        table['pretp.1s'] = verb.substring(0, verb.length - 3) + 'cé';
      }
    } else if (declination == 'er') {
      table = {
        'pres.1s': root + 'o',
        'pres.2s': root + 'és',
        'pres.3s': root + 'e',
        'pres.1p': root + 'emos',
        'pres.3p': root + 'en',
        'pretp.1s': root + 'í',
        'pretp.2s': root + 'iste',
        'pretp.3s': root + 'ió',
        'pretp.1p': root + 'imos',
        'pretp.3p': root + 'ieron',
        'preti.1s': root + 'ía',
        'preti.2s': root + 'ías',
        'preti.3s': root + 'ía',
        'preti.1p': root + 'íamos',
        'preti.3p': root + 'ían',
      };
    } else if (declination == 'ir' || declination == 'ír') {
      table = {
        'pres.1s': root + 'o',
        'pres.2s': root + 'ís',
        'pres.3s': root + 'e',
        'pres.1p': root + 'imos',
        'pres.3p': root + 'en',
        'pretp.1s': root + 'í',
        'pretp.2s': root + 'iste',
        'pretp.3s': root + 'ió',
        'pretp.1p': root + 'imos',
        'pretp.3p': root + 'ieron',
        'preti.1s': root + 'ía',
        'preti.2s': root + 'ías',
        'preti.3s': root + 'ía',
        'preti.1p': root + 'íamos',
        'preti.3p': root + 'ían',
      };
    } else {
      throw Error("Invalid verb: " + verb + "."); 
    }

    // Irregular verbs.
    let itable = {};
    if (verb in IRREGULAR_VERBS) {
      itable = IRREGULAR_VERBS[verb];
    }
    for (let k in itable) {
      table[k] = itable[k];
    }
    return table;
  }

}

