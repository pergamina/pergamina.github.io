
class Contact {

  // Status:
  // ['empty']
  // ['self', text]
  // ['other', count, text]
  constructor(name, color, msgapp) {
    let self = this;
    name = this._normalize_name(name);
    this._msgapp = msgapp;
    // Contact element
    this._status = ['empty'];
    this._last_seen = new Date();
    this._statusE = DIV('contact-status', []);
    this._contact_picture = DIV1('contact-picture', TEXT(this._initials(name)));
    this._contact_picture.classList.add(color);
    this._contact_elem = DIV('contact', [
      this._contact_picture,
      DIV1('contact-name', TEXT(name)),
      this._statusE,
    ]);
    this._contact_elem.onclick = function () {
      msgapp.switch_to(self);
    };
    // Chat element
    this._chat_text = DIV('chat-text', []);
    this._chat_input_text = INPUT_TEXT();
    this._chat_input_text.onkeyup = function (evt) {
      if (evt.keyCode === 13) {
        self._chat_send_button.onclick();
      } else if (self._chat_input_text.value === '') {
        self._chat_send_button.hide();
      } else {
        self._chat_send_button.show();
      }
    };
    this._chat_send_button = BUTTON('', function () {
      if (self._chat_input_text.value === '') {
        return;
      }
      self.write_self(self._chat_input_text.value);
      self._chat_input_text.value = '';
      self._chat_send_button.hide();
      self._chat_input_text.focus();
      self._chat_text.scrollTop = self._chat_text.scrollHeight; 
    });
    this._chat_send_button.show = function () {
      self._chat_send_button.style.display = 'block';
    };
    this._chat_send_button.hide = function () {
      self._chat_send_button.style.display = 'none';
    };
    this._chat_send_button.hide();
    this._chat_title_statusE = DIV('chat-title-status', []);
    this._chat_elem = DIV('chat', [
      DIV('chat-title', [
        TEXT(name),
        this._chat_title_statusE
      ]),
      this._chat_text,
      DIV('chat-input', [
        this._chat_input_text,
        this._chat_send_button
      ]),
    ]);
    // Init
    this._draw_status(this._status);
    this._focused = false;
    this.hide_chat();
  }

  contact_element() {
    return this._contact_elem;
  }

  chat_element() {
    return this._chat_elem;
  }

  show_chat() {
    this._contact_elem.classList.add('selected');
    this._chat_elem.style.display = 'block';
    this._chat_input_text.focus();
    this._focused = true;
    this._read_all();
  }

  hide_chat() {
    this._contact_elem.classList.remove('selected');
    this._chat_elem.style.display = 'none';
    this._focused = false;
  }

  _write(who, text) {
    let time = this._time_str(new Date());
    let elem = this._chat_text;
    let at_bottom = elem.scrollHeight - elem.clientHeight <= elem.scrollTop + 1;
    elem.append(DIV1('message-wrapper',
                  DIV('message-' + who, [
                    TEXT(text),
                    DIV1('message-time', TEXT(time)),
                  ])));
    this._update_text_status(who, text);
    if (at_bottom) {
      elem.scrollTop = elem.scrollHeight; 
    }
  }

  _update_text_status(who, text) {
    if (who === 'self') {
      this._status = ['self', text];
    } else if (who === 'other' && this._focused) {
      this._status = ['other', 0, text];
    } else if (who === 'other' && this._status[0] === 'other') {
      this._status = ['other', this._status[1] + 1, text];
    } else {
      this._status = ['other', 1, text];
    }
    this._draw_status(this._status);
  }

  _read_all() {
    if (this._status[0] === 'other') {
      this._status[1] = 0;
    }
    this._draw_status(this._status);
  }

  _draw_status(stat) {
    clearElem(this._statusE);
    if (stat[0] === 'self') {
      this._statusE.appendChild(SPAN1('status-sent', TEXT('➤')));
      this._statusE.appendChild(SPAN1('status-text', TEXT(stat[1])));
    } else if (stat[0] === 'other') {
      this._statusE.appendChild(SPAN1('status-text', TEXT(stat[2])));
      if (stat[1] > 0) {
        this._statusE.appendChild(DIV1('status-count', TEXT(stat[1])));
      }
    }
    clearElem(this._chat_title_statusE);
    this._chat_title_statusE.appendChild(TEXT(this._time_str(this._last_seen)));
  }

  _is_typing() {
    let message = 'Escribiendo...';
    clearElem(this._statusE);
    this._statusE.appendChild(
      SPAN1('status-notification', TEXT(message))
    );
    if (this._status[0] === 'other' && this._status[1] > 0) {
      this._statusE.appendChild(DIV1('status-count', TEXT(this._status[1])));
    }
    clearElem(this._chat_title_statusE);
    this._chat_title_statusE.appendChild(TEXT(message));
  }

  type(verses) {
    let self = this;
    function go(i, j) {
      if (i >= verses.length) {
        self._wait_until_answer(function () {
          go(0, 0);
        });
        return;
      } 
      let text = verses[i];
      if (j >= text.length) {
        self.write_other(text);
        function cont() {
          setTimeout(function () {
            go(i + 1, 0);
          }, 100 + Math.random() * 2000);
        }
        if (Math.random() < 0.3) {
          self._wait_until_read(cont);
        } else {
          cont();
        }
      } else {
        let wait = 0;
        if (text[j] === ' ' && Math.random() < 0.2) {
          self._draw_status(self._status);
          wait = 100;
        } else {
          self._is_typing();
        }
        setTimeout(function () {
          go(i, j + 1);
        }, 50 + Math.random() * 50 + Math.random() * wait);
      }
    }
    go(0, 0);
  }

  _wait_until_read(cont) {
    let self = this;
    if (this._status[0] === 'other' && this._status[1] > 0) {
      setTimeout(function () {
        self._wait_until_read(cont);
      }, Math.random() * 2000);
    } else {
      cont();
    }
  }

  _wait_until_answer(cont) {
    let self = this;
    if (this._status[0] !== 'self') {
      setTimeout(function () {
        self._wait_until_answer(cont);
      }, Math.random() * 2000);
    } else {
      cont();
    }
  }

  write_self(text) {
    this._write('self', text);
  }

  write_other(text) {
    this._last_seen = new Date();
    this._write('other', text);
  }

  _normalize_name(string) {
    return string.replace(/ +/g, ' ').trim();
  }

  _initial(string) {
    if (string.length > 0) {
      return string.substring(0, 1).toUpperCase();
    } else {
      return '';
    }
  }

  _initials(name) {
    let initials = '';
    let name_parts = name.split(' ');
    if (name_parts.length > 1) {
      initials = this._initial(name_parts[0])
               + this._initial(name_parts[name_parts.length - 1]);
    } else if (name_parts.length == 1) {
      initials = this._initial(name_parts[0]);
    }
    return initials;
  }

  _time_str(date) {
    return date.toLocaleString('en-US', {
             hour: 'numeric',
             minute: 'numeric',
             hour12: true
           });
  }

}

class MsgApp {

  constructor(contactsE, interactionE) {
    this._contactsE = contactsE;
    this._interactionE = interactionE;
    this._contacts = [];
  }

  add_contact(name, color) {
    let contact = new Contact(name, color, this);
    this._contactsE.append(contact.contact_element());
    this._interactionE.append(contact.chat_element());
    this._contacts.push(contact);
    return contact;
  }

  switch_to(contact) {
    for (let c of this._contacts) {
      c.hide_chat();
    }
    contact.show_chat();
  }

}

function start_chat(names) {
  let msgapp = new MsgApp(_('contacts'), _('interaction'));
  let contacts = [];
  for (let i = 0; i < 10; i++) {
    contacts.push(msgapp.add_contact(names[i], 'col' + i));
  }
  for (let i = 0; i < 10; i++) {
    setTimeout(function () {
      contacts[i].type(VERSES[i]);
    }, Math.random() * i * 20000);
  }
}

function main() {
  let initE = DIV('init', []);
  document.body.appendChild(initE);
  initE.append(TEXT('Introduzca los nombres de diez personas muertas:'));
  let namesE = [];
  let tableE = document.createElement('table');
  for (let i = 0; i < 10; i++) {
    let row = document.createElement('tr');
    let cell1 = document.createElement('td');
    let cell2 = document.createElement('td');
    let nameE = INPUT_TEXT();
    nameE.onkeyup = function () {
      if (nameE.value.trim() === '') {
        nameE.classList.add('bad');
      } else {
        nameE.classList.remove('bad');
      }
    };
    namesE.push(nameE);
    cell1.append(TEXT(i));
    cell2.append(nameE);
    row.append(cell1);
    row.append(cell2);
    tableE.append(row);
  }
  initE.append(tableE);
  initE.append(BUTTON('continuar', function () {
    let names = [];
    for (let nameE of namesE) {
      if (nameE.value.trim() === '') {
        nameE.classList.add('bad');
        nameE.focus();
        return;
      }
      names.push(nameE.value);
    }
    start_chat(names);
    document.body.removeChild(initE);
  }));
  namesE[0].focus();
}

