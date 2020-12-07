
function clearElem(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

function P(children) {
  let elem = document.createElement('p');
  for (let child of children) {
    elem.appendChild(child);
  }
  return elem;
}

function P1(child) {
  return P([child]);
}

function SPAN(cls, children) {
  let elem = document.createElement('span');
  elem.className = cls;
  for (let child of children) {
    elem.appendChild(child);
  }
  return elem;
}

function A(text, link) {
  let elem = document.createElement('a');
  elem.href = link;
  elem.appendChild(text);
  return elem;
}

function A_onclick(text, action) {
  let elem = document.createElement('a');
  elem.href = 'javascript:void(0)';
  elem.onclick = action;
  elem.appendChild(text);
  return elem;
}


function SPAN1(cls, child) {
  return SPAN(cls, [child]);
}

function BR(str) {
  return document.createElement('br');
}

function TEXT(str) {
  return document.createTextNode(str);
}

