


let SYMBOLS = {
  "h": 0.00,
  "u": 0.01,
  "g": 0.03,
  "n": 0.04,
  "话": 0.06,
  "9": 0.07,
  "m": 0.09,
  "c": 0.10,
  "莲": 0.12,
  "e": 0.13,
  "x": 0.15,
  ".": 0.16,
  "z": 0.18,
  "[": 0.19,
  "ü": 0.21,
  "r": 0.22,
  " ": 0.24,
  "'": 0.25,
  "0": 0.26,
  "a": 0.28,
  "]": 0.29,
  "i": 0.31,
  "l": 0.32,
  "\"": 0.34,
  "4": 0.35,
  "ì": 0.37,
  "k": 0.38,
  "ē": 0.40,
  "à": 0.41,
  "í": 0.43,
  "o": 0.44,
  "2": 0.46,
  "é": 0.47,
  "v": 0.49,
  "8": 0.50,
  ",": 0.51,
  "f": 0.53,
  "¿": 0.54,
  "股": 0.56,
  "花": 0.57,
  "t": 0.59,
  "通": 0.60,
  "战": 0.62,
  "ú": 0.63,
  "争": 0.65,
  "d": 0.66,
  ")": 0.68,
  "ǔ": 0.69,
  "屁": 0.71,
  "ā": 0.72,
  "b": 0.74,
  "j": 0.75,
  "ō": 0.76,
  "5": 0.78,
  "(": 0.79,
  "3": 0.81,
  "7": 0.82,
  "á": 0.84,
  "普": 0.85,
  ":": 0.87,
  "-": 0.88,
  "s": 0.90,
  "ó": 0.91,
  "p": 0.93,
  "y": 0.94,
  "?": 0.96,
  "6": 0.97,
  "1": 0.99
};

function evalCmd(full, cmd, elem) {
  clearElem(elem);
  if (full.length === cmd.length) return;
  let newDiv = DIV('innercanvas', [buildElem(cmd, cmd.length, 0)]);
  elem.appendChild(newDiv);
}

function isVowel(x) {
  return x === 'a'
      || x === 'e'
      || x === 'i'
      || x === 'o'
      || x === 'u';
}

let MAX_ROT = 20;

function buildElem(cmd, i, depth) {
  if (i === 0 || depth > 40) {
    let box = DIV('box', []);
    box.style.border += ' solid white 2px';
    return box;
  }

  let l = (cmd.length % 2 === 0) ? cmd[i - 1] : cmd[cmd.length - i - 1];
  let p = (l in SYMBOLS) ? SYMBOLS[l] : 0.5;
  let rad = Math.floor(p * 50);
  if (Math.cos(p * Math.PI) < 0) {
    let box = DIV('box', []);
    box.style.border = 'solid white 2px';
    if (l === 'a') {
      box.style.transform += ' rotate(1deg)';
    } else if (l === 'e') {
      box.style.transform += ' rotate(-1deg)';
    } else if (l === 'i') {
      box.style.transform += ' rotate(2deg)';
    } else if (l === 'o') {
      box.style.transform += ' rotate(-2deg)';
    }

    if (l === 'b' || l === 'c' || l === 'd' || l === 'f' || l === 'g') {
      box.style.padding = '2%';
    } else if (l === 'h' || l === 'j' || l === 'k' || l === 'l' || l === 'm') {
      box.style.padding = '5%';
    } else {
      box.style.padding = '10%';
    }

    if (l === 'b' || l === 'f' || l === 'j' || l === 'm' || l === 'p') {
      box.style.opacity = '0.75';
    } else if (l === 'c' || l === 'g' || l === 'k' || l === 'n' || l === 'r') {
      box.style.opacity = '0.7';
    } else {
      box.style.opacity = '0.7';
    }
    box.appendChild(buildElem(cmd, i - 1, depth + 1));
    box.style.borderRadius = rad.toString() + '%';
    return box;
  } else {
    let box = DIV('box', []);
    let bsize = Math.floor(1 + p * 7);
    box.style.border = 'solid white ' + bsize + 'px';

    // Rotation
    let deg = Math.floor(p * MAX_ROT - MAX_ROT / 2);
    if (i % 2 === 0) {
      deg = -deg;
    }
    box.style.transform += ' rotate(' + deg.toString() + 'deg)';

    // Opacity
    box.style.opacity = '0.9';
    let size = 80 + Math.floor(Math.sin(p) * 20);
    box.style.height = size.toString() + '%';
    box.style.width = size.toString() + '%';
    box.style.padding = Math.floor(p * 10).toString() + '%';

    // Rounded
    box.style.borderRadius = rad.toString() + '%';

    box.appendChild(buildElem(cmd, i - 1, depth + 1));
    return box;
  }
}
