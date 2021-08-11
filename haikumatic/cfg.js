
function is_upper(x) {
  return 'A' <= x && x <= 'Z';
}

/* Build a regular context-free grammar from a template grammar
 * with parameterized symbols.
 *
 * Terminal and non-terminal symbols can be parameterized
 * with parameters representing gender, number, and person.
 *
 * Parameter names must start with:
 *   'g' for gender (values: '#m', '#f')
 *   'n' for number (values: '#s', '#p')
 *   'p' for person (values: '#1', '#2', '#3').
 *
 * For instance "NounPhrase.g.n" is a non-terminal symbol "NounPhrase"
 * with a gender and a number parameter, "NounPhrase.#f.n" is instantiated
 * for feminine gender.
 */
function cfg_expand(grammar_template) {

  function split_args(x) {
    let args0 = x.split('.');
    let f = args0.shift();
    let args = [];
    for (let arg of args0) {
      if (arg.startsWith('#')) {
        args.push(['CONST', arg]);
      } else {
        args.push(['VAR', arg]);
      }
    }
    return [f, args];
  }

  /* Form of the normalized grammar:
   *
   *   grammar ::= ['GRAMMAR', prods]
   *   prods   ::= [prod1, ..., prodN]
   *   prod    ::= ['PRODUCTION', string, args, alts]
   *   args    ::= [arg1, ..., argN]
   *   arg     ::= ['CONST', '#m'] | ['CONST', '#f']
                 | ['CONST', '#s'] | ['CONST', '#p']
                 | ['CONST', '#1'] | ['CONST', '#2'] | ['CONST', '#3']
                 | ['VAR', string]
   *   alts    ::= [alt1, ..., altN]
   *   alt     ::= ['ALT', number, terms]
   *   terms   ::= [term1, ..., termN]
   *   term    ::= ['CALL', string, args]
   *             | ['LIT', string]
   */
  function normalize(grammar_template) {
    let normalized_productions = [];
    for (let lhs0 in grammar_template) {
      let [lhs, args] = split_args(lhs0);
      let rhs0 = grammar_template[lhs0];
      let rhs = [];
      for (let alternative0 of rhs0) {
        let weight = 1;
        if (typeof(alternative0) !== 'string') {
          weight = alternative0[0];
          alternative0 = alternative0[1];
        }
        let alternative = [];
        let symbols0 = alternative0.split(' ');
        for (let symbol0 of symbols0) {
          if (symbol0.length > 0 && is_upper(symbol0[0])) {
            let [symbol, symbol_args] = split_args(symbol0);
            alternative.push(['CALL', symbol, symbol_args]);
          } else {
            alternative.push(['LIT', symbol0]);
          }
        }
        rhs.push(['ALT', weight, alternative]);
      }
      normalized_productions.push(['PRODUCTION', lhs, args, rhs]);
    }
    return ['GRAMMAR', normalized_productions];
  }

  function filter_variables(known_vars, args) {
    let res = [];
    for (let arg of args) {
      if (arg[0] === 'VAR' && !(arg[1] in known_vars)) {
        res.push(arg[1]);
        known_vars[arg[1]] = true;
      }
    }
    return res;
  }

  function all_environments(vars, i) {
    if (i === vars.length) {
      return [[]];
    }
    let varname = vars[i];
    let vartype = (varname.length > 0) ? varname[0] : '';
    let values =
      vartype == 'g' ? ['#m', '#f'] :
      vartype == 'n' ? ['#s', '#p'] :
      vartype == 'p' ? ['#1', '#2', '#3'] : ['##'];
    let res = [];
    for (let value of values) {
      for (let env of all_environments(vars, i + 1)) {
        res.push(env.concat([[varname, value]]));
      }
    }
    return res;
  }

  function expand_call(envmap, fn, args) {
    let e_args = [];
    for (let arg of args) {
      if (arg[0] === 'VAR') {
        e_args.push(envmap[arg[1]]);
      } else {
        e_args.push(arg[1]);
      }
    }
    return fn + e_args.join('');
  }

  function expand_terms(envmap, terms) {
    let e_terms = [];
    for (let term of terms) {
      if (term[0] == 'CALL') {
        e_terms.push(expand_call(envmap, term[1], term[2]));
      } else {
        e_terms.push(term[1]);
      }
    }
    return e_terms;
  }

  function expand(grammar0) {
    let expanded_grammar = {};
    for (let [_, fn, args, alts] of grammar0[1]) {
      for (let [_, weight, terms] of alts) {
        // Collect variable names
        let known_vars = {};
        let vars = filter_variables(known_vars, args); 
        for (let term of terms) {
          if (term[0] == 'CALL') {
            let term_args = term[2];
            vars = vars.concat(filter_variables(known_vars, term_args));
          }
        }
        // Create a production for each instantiation of the variables
        for (let env of all_environments(vars, 0)) {
          let envmap = {};
          for (let [varname, value] of env) {
            envmap[varname] = value;
          }
          let e_lhs = expand_call(envmap, fn, args); // e_lhs may repeat
          let e_terms = expand_terms(envmap, terms);
          if (!(e_lhs in expanded_grammar)) {
            expanded_grammar[e_lhs] = [];
          }
          expanded_grammar[e_lhs].push([weight, e_terms]);
        }
      }
    }
    return expanded_grammar;
  }

  return expand(normalize(grammar_template));

}

