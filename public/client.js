const proxyUrl = new URL('/proxy/', window.location.href).href;

var app = new Vue({
  el: '#app',
  data: {  // TODO: make a button to insert example data or something
    rawUrls: 'https://pastebin.com/raw/ufM3vsvk',
    fields: [{
      name: 'title',
      selector: '//a/text()'
    }, {
      name: 'url',
      selector: '//a/@href'
    },],
    displayTemplate: '',  // <a href="{{ url }}">{{ title }}</a>
    result: ''
  },

  computed: {},

  methods: {
    addField: function addField(event) {
      this.fields.push({ name: '', selector: '' });
    },

    removeField: function removeField(index) {
      this.fields.splice(index, 1);
    },

    run: function run() {
      this.result = '';
      for (let url of this.rawUrls.split("\n")) {
        runSequential(proxyUrl, url, this.fields, this.displayTemplate)
          .then(res => this.result = this.result + res)
          .catch(err => console.log(err));
      }
    }
  }
});

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function handleFetchErrors(response) {
  if (!response.ok) {
    let errMsg = 'HTTP ' + response.status;
    if (response.statusText) {
      errMsg += ` (${response.statusText})`;
    }
    throw new Error(errMsg);
  }
  return response;
}

async function fetchViaProxy(proxyUrl, url, options = {}) {
  return await fetch(proxyUrl + url, options);
}

async function runSequential(proxyUrl, url, fields, displayTemplate) {
  let fieldResults;
  try {
    const resp = handleFetchErrors(await fetchViaProxy(proxyUrl, url)),
      body = await resp.text(),
      el = createElementFromHTML(body),
      nsResolver = document.createNSResolver(el.ownerDocument == null ?
        el.documentElement :
        el.ownerDocument.documentElement);
    
    fieldResults = fields.map(f => ({ name: f.name, value: extractField(el, nsResolver, f.selector) }));
    return render(fieldResults, displayTemplate);
  }
  catch (err) {
    throw (err);
  }
}

function render(fieldResults, template) {
  let result = {};
  for (let fieldResult of fieldResults) {
    result[fieldResult.name] = fieldResult.value;
  }

  if (template != '') {
    return 'Template is not implemented yet';
  } else {
    return JSON.stringify(result);
  }
}

function extractField(el, nsResolver, selector) {
  const result = document.evaluate(selector, el, nsResolver, XPathResult.ANY_TYPE, null);
  return processResult(result);
}

function processResult(xpr) {
  switch (xpr.resultType) {
    case XPathResult.NUMBER_TYPE:
      return xpr.numberValue;
      break;

    case XPathResult.STRING_TYPE:
      return xpr.stringValue;
      break;

    case XPathResult.BOOLEAN_TYPE:
      return xpr.booleanValue;
      break;

    // Single node result
    case XPathResult.ANY_UNORDERED_NODE_TYPE:
    case XPathResult.FIRST_ORDERED_NODE_TYPE:
      return processNode(xpr.iterateNext());
      break;

    // Nodeset result
    default:
      return NodeSetToArray(xpr).map(processNode).join("\n");
      break;
  }
}

function processNode(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node.nodeValue;
      break;

    default:
      return node.textContent;
      break;
  }
}

function NodeSetToArray(xpr) {
  let rv = [],
    thisNode = xpr.iterateNext();

  while (thisNode) {
    rv.push(thisNode);
    thisNode = xpr.iterateNext();
  }

  return rv;
}