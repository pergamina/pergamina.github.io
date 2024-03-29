
function _(id) {
  return document.getElementById(id);
}

function clearElem(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

function H1(child) {
  let elem = document.createElement('h1');
  elem.appendChild(child);
  return elem;
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

function DIV(cls, children) {
  let elem = document.createElement('div');
  elem.className = cls;
  for (let child of children) {
    elem.appendChild(child);
  }
  return elem;
}

function DIV1(cls, child) {
  return DIV(cls, [child]);
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

function BUTTON(text, action) {
  let elem = document.createElement('input');
  elem.type = 'button';
  elem.value = text;
  elem.onclick = action;
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

function INPUT_TEXT() {
  let elem = document.createElement('input');
  elem.type = 'text';
  return elem;
}

function IMG(src) {
  let elem = document.createElement('img');
  elem.src = src;
  return elem;
}

function appendFirst(elem, child) {
  elem.insertBefore(child, elem.firstChild);
}

