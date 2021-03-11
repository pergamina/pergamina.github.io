
let STATE = [];

function select(i) {
  function img_name() {
    return 'captcha/f' + i + '_' + STATE[i] + '.png';
  }
  let poem = _('poem');
  clearElem(poem);
  for (let j = 0; j < STATE[i]; j++) {
    if (VERSES[i][j] === '') {
      appendFirst(poem, BR());
    } else {
      appendFirst(poem, P1(TEXT(VERSES[i][j])));
    }
  }
  let captcha = _('captcha');
  clearElem(captcha);
  if (STATE[i] == VERSES[i].length) {
    return;
  }
  let img = IMG(img_name());
  captcha.appendChild(img);
  captcha.appendChild(BR());
  
  function normalize(text) {
    return text.toLowerCase()
               .replace(/á/g, 'a')
               .replace(/é/g, 'e')
               .replace(/í/g, 'i')
               .replace(/ó/g, 'o')
               .replace(/ú/g, 'u')
               .replace(/[.]/g, ' ')
               .replace(/[,]/g, ' ')
               .replace(/[;]/g, ' ')
               .replace(/[:]/g, ' ')
               .replace(/[¿]/g, ' ')
               .replace(/[?]/g, ' ')
               .replace(/[¡]/g, ' ')
               .replace(/[!]/g, ' ')
               .replace(/ +/g, ' ')
               .replace(/^ +/, '')
               .replace(/ +$/, '');
  }

  function isSemivalid(text) {
    let source = normalize(text);
    let target = normalize(VERSES[i][STATE[i]]);
    return source.length <= target.length
        && source === target.substr(0, source.length);
  }

  function isValid(text) {
    let source = normalize(text);
    let target = normalize(VERSES[i][STATE[i]]);
    return source === target;
  }

  let input = INPUT_TEXT();
  input.placeholder = 'Escriba el texto';
  let btn = BUTTON('-', function () {});
  captcha.appendChild(input);
  captcha.appendChild(btn);
  input.onchange = function () {
    if (isValid(input.value)) {
      btn.onclick = function () {
        if (STATE[i] == VERSES[i].length - 1) {
          clearElem(captcha);
        }
        appendFirst(poem, P1(TEXT(VERSES[i][STATE[i]])));
        STATE[i] += 1;
        if (VERSES[i][STATE[i]] == "") {
          appendFirst(poem, BR());
          STATE[i] += 1;
        }
        img.src = img_name();
        btn.onclick = function () {};
        btn.value = '-';
        btn.className = '';
        input.className = '';
        input.value = '';
        input.focus();
      };
      btn.value = '+'
      btn.className = 'valid';
      input.className = 'valid';
    } else if (isSemivalid(input.value)) {
      btn.onclick = function () {};
      btn.value = '-'
      btn.className = '';
      input.className = '';
    } else {
      btn.onclick = function () {};
      btn.value = '!!'
      btn.className = 'invalid';
      input.className = 'invalid';
    }
  };
  input.onkeyup = input.onchange;
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      btn.click();
    }
  }); 
  input.focus();
}

function main() {
  let menu = _('menu');
  for (let i = 0; i < VERSES.length; i++) {
    STATE.push(0);
  }
  for (let i = 0; i < VERSES.length; i++) {
    menu.append(BUTTON(i, function () {
      select(i);
    }));
  }
}

