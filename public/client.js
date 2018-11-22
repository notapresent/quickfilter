var app = new Vue({
    el: '#app',
    data: {
        rawUrls: 'https://pastebin.com/raw/ufM3vsvk',
        fields: [{
            name: 'title',
            selector: '//html[1]/body[1]//a[1]/text()'
        }, {
            name: 'url',
            selector: '//html[1]/body[1]//a[1]/@href'
        }, ],
        displayTemplate: ''
    },
  computed: {

  },
methods: {
  addField: function(event) {
    this.fields.push({name: '', selecor: ''});
  },
  removeField: function(index) {
      this.fields.splice(index, 1);
  }
}                           

});
