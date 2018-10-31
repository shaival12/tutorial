var vm = new Vue({
   el: '#playerContainer',
   data: {
      firstname : "Ria",
      lastname  : "Singh",
      htmlcontent : "<div class='card text-black border-primary mb-3' style='max-width: 10rem;margin-left:2%;'>"+
                   "<div class='card-header'>1</div>"+
                   "<div class='card-body'> "+
                   "<p class='card-text'>Gopal2</p>"+
                   "</div>"+
                   "</div>"
   },
  computed : {
    showUsers: function () {
       return this.htmlcontent;
    }
  }
})