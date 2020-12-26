
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

function buildElem(cmd, i, depth) {
  if (i === 0) {
    let box = DIV('box', []);
    box.className += ' col' + (cmd.length % 10).toString();
    box.style.border += ' solid white 2px';
    return box;
  } else {
    let l = (cmd.length % 2 === 0) ? cmd[i - 1] : cmd[cmd.length - i - 1];
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
      box.style.opacity = '1';
    } else {
      box.style.opacity = '0.9';
    }

    box.appendChild(buildElem(cmd, i - 1, depth + 1));
    return box;
  }
}