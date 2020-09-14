const D2IReader = require('./lib/D2IReader');

const d2i = new D2IReader('./resources/d2i/i18n_fr.d2i');
console.log(d2i.getText(1));