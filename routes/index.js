const router = require('express').Router()

/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ceci est un blog' })
})

module.exports = router
