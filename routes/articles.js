const router = require('express').Router()
const Session = require('../models/sessions')
const Article = require('../models/articles')
const bcrypt = require('bcryptjs')
const math = require('math')
const db = require('sqlite')


db.open('bdd.db').then(() => {
	console.log('> BDD opened')
	return db.run('CREATE TABLE IF NOT EXISTS articles (title, content, createdAt, updatedAt)')
	})


	/* Articles : liste */
	router.get('/', (req, res, next) => {
			var nbrArticlesTotal = 0
			var limitToShow = 5
			Article.count().then((nbrArticles) => {
				nbrArticlesTotal = nbrArticles[0]['nbrArticles']
			}).catch((err) => {
				console.log(err)
			})
			Article.listWithPagination(limitToShow, req.query).then((articles) => {
				nbrPages = math.ceil((nbrArticlesTotal/limitToShow), -1)
				if (!req.query.offset || req.query.offset == 0) {
					pageActuelle = 1
				} else {
					pageActuelle = (req.query.offset/limitToShow)+1
				}
				var isDisableNe = false
				var isDisableRe = false
				var prec = "/articles?offset="+((pageActuelle*limitToShow)-(2*limitToShow))
				var suiv = "/articles?offset="+(pageActuelle*limitToShow)
				if (pageActuelle == 1) {
					var isDisableRe = true
					var prec = ""
				}
				if (pageActuelle == nbrPages) {
					var isDisableNe = true
					var suiv = ""
				}
				res.format({
					html: () => {
						res.render('articles/showAll', {
							title: 'All Articles',
							articles: articles,
							avancement: pageActuelle+"/"+nbrPages,
							precedent: prec,
							suivant: suiv,
							isDisabledReturn: isDisableRe,
							isDisabledNext: isDisableNe
						})
					},
					json: () => {
						res.send(articles)
					}
				})
			})
		})

	router.get('/add', (req, res) => {
		res.format({
			html: () => {
				res.render('articles/edit', {
					title: 'Add article',
					action: '/articles'
				})
			},
			json: () => {
				res.status(400)
				res.end()
			}
		})
	})

	router.get('/me', (req, res) => {
		var token = Session.getToken(req)
		Article.getId(token).then((articleId) => {
			res.redirect('/articles/'+articleId)
		})
	})

	router.get('/:articleId', (req, res) => {
		var token = Session.getToken(req)
		Article.getId(token).then((thisArticleId) => {
			Article.getById(req.params.articleId).then((article) => {
				if (article == '') return next()
				var notThisOne = true
				if (thisArticleId == req.params.articleId) notThisOne = false
				// cheat moche à changer
				// var save = article[0];
				// req.params.title = save.title;
				// console.log(req.params);
				res.format({
					html: () => {
						res.render('articles/show', {
							title: 'Utilisateur '+req.params.articleId,
							article: article,
							suppr: '/articles/'+req.params.articleId+'?_method=DELETE',
							modif: '/articles/'+req.params.articleId+'/edit',
							notThisOne: notThisOne
						})
					},
					json: () => {
						res.send(article)
					}
				})
			}).catch((err) => {
				console.log(err)
			})
		})
	})

	router.post('/', (req, res) => {
		if (req.body.title == "" || req.body.content == "" ) {
			res.format({
				html: () => {
					res.render('articles/edit', {
						title: 'Articles',
						warning: true
					})
				},
				json: () => {
					res.send({message: 'Error !'})
				}
			})
		} else {
			Article.getByTitle(req.body.title).then((article) => {
				if (article != "") {
					res.format({
						html: () => {
							res.render('articles/edit', {
								title: 'Articles',
								taken: true
							})
						},
						json: () => {
						res.send({message: 'Title taken'})
				}
			})
				} else {
					Article.insert(req.body).then((result) => {
						res.format({
							html: () => {
								res.redirect('/articles')
							},
							json: () => {
								res.send({message: 'Success'})
							}
						})
					}).catch((err) => {
						console.log(err)
						res.end('ça marche pas')
					})
				}
			}).catch((err) => {
				console.log(err)
			})
		}
	})

	router.get('/:articleId/edit', (req, res) => {
		Article.getById(req.params.articleId).then((article) => {
			if (article =='') return next()
			res.format({
				html: () => {
					res.render('articles/edit', {
						title: 'Update article '+ req.params.articleId,
						article: article,
						action: '/articles/' + req.params.articleId + '?_method=PUT'
					})
				},
				json: () => {
					res.status(400)
					res.end()
				}
			})
		}).catch((err) => {
			res.status(404)
			res.end('Article not found')
		})
	})

	router.put('/:articleId', (req, res) => {
		Article.getById(req.params.articleId).then((article) => {
			Article.update(req.body, req.params).then((result) => {
				res.format({
					html: () => {
						res.redirect('/articles')
					},
					json: () => {
						res.send({message: 'Success'})
					}
				})
			}).catch((err) => {
				res.end("error")
			})
		})
	})

	router.delete('/:articleId', (req, res) => {
		console.log("début delete");
		var articleId = req.params.articleId;
		Article.getById(articleId).then((article) => {
			// sale
			var save = article[0]
			var title = save.title
			if (article != '') {
					Article.delete(title).then((result) => {
						console.log('supression ok');
						res.format({
							html: () => {
								res.redirect('/articles')
							},
							json: () => {
								res.send({message: 'Success'})
							}
						})
					}).catch((err) => {
						res.status(404)
						res.end('ERR4 > '+err)
					})
			} else {
				res.end('Article doesn\'t exist')
			}
		})
	})


	router.all('*', (req, res) => {
		res.status(501)
		res.end("URL not valid")
	})

	module.exports = router
