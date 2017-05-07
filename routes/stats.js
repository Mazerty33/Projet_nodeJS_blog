const router = require('express').Router()

const bcrypt = require('bcryptjs')
const moment = require('moment')
const math = require('math')
const db = require('sqlite')

const Session = require('../models/sessions')
const User = require('../models/users')
const Article = require('../models/articles')

// Converti les dates now en dates lisibles
function timeConverter(UNIX_timestamp){
	return moment(UNIX_timestamp).format("DD-MM-YYYY h:mm:ss")
}

/* Articles : liste */
router.get('/', (req, res, next) => {
    var nbrArticlesTotal = 0
    var limitToShow = 100
    Article.listWithPagination(limitToShow, req.query).then((articles) => {
      nbrPages = math.ceil((nbrArticlesTotal/limitToShow), -1)
      if (!req.query.offset || req.query.offset == 0) {
        pageActuelle = 1
      } else {
        pageActuelle = (req.query.offset/limitToShow)+1
      }
      var isDisableNe = false
      var isDisableRe = false
      if (pageActuelle == 1) {
        var isDisableRe = true
        var prec = ""
      }
      if (pageActuelle == nbrPages) {
        var isDisableNe = true
        var suiv = ""
      }
			var save = articles[0];
			title = save.title;
			DataTitle = [];
			DataVus = [];
			for (var name in articles) {
				DataTitle.push(articles[name].title);
			 }
			 for (index in DataTitle){
				 		Article.GetView(DataTitle[index]).then((result) =>{
							DataVus.push(result);
						})
			 }
			 console.log(DataTitle);
			 console.log(DataVus);

			 var View = 5;
				res.format({
					html: () => {
						res.render('stats/stats', {
							title: 'All Articles',
							articles: articles,
							View : View
						})
					},
					json: () => {
						res.send(articles)
					}
				})
    })
  })

//realy need comment?
router.all('*', (req, res) => {
	res.status(501)
	res.end("Error !")
})

module.exports = router
