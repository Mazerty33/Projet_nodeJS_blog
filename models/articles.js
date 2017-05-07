const db = require('sqlite')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const Session = require('../models/sessions')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const redis = new Redis()

function timeConverter(UNIX_timestamp){
	return moment(UNIX_timestamp).format("DD-MM-YYYY h:mm:ss")
}

var shemaArticle = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: String,
  updatedAt: String,
})

// Model
var ArticleModel = mongoose.model('article', shemaArticle);

module.exports = {

// fonctions principales
	insert: (params) => {
	var date = timeConverter(Date.now());
	var newArticle = new ArticleModel({
		title: params.title,
		content: params.content,
		createdAt: date,
		updatedAt: date,
		})
	return newArticle.save().then((result) => {
		return db.run('INSERT INTO articles (title, content) VALUES (?, ?)',
			params.title,
			params.content)
	}).then((result) => {
		return redis.hmset('Article:'+params.title, 'Vus', 0)
	})
},


	update: (body, params) => {
		var title = body.title;
		var content = body.content;
		var date = timeConverter(Date.now());
		return ArticleModel.update( {$set: {content: content, updatedAt: date}}).then((result) => {
				return db.all('UPDATE articles SET title = ?, content = ? WHERE rowid = ?',
					body.title,
					body.content,
					params.articleId)
			}).then((result) => {
				return redis.del('Article:'+params.title)
			}).then((result) => {
				return redis.hmset('Article:'+params.title, 'Vus', 0)
			})
	},



	delete: (title) => {
		console.log(title);
		return ArticleModel.remove({title: title}).then((result) => {
			return db.all('DELETE FROM articles WHERE title = ?',title)
		}).then((result) => {
			return redis.del('Article:'+title)
		})
	},

// getters
	getId: (accessToken) => {
		return Session.exists(accessToken).then((result) => {
			return result.articleId
		})
	},

	getById: (id) => {
		return db.all('SELECT rowid, * FROM articles WHERE rowid = ?',
			id)
	},

	getByTitle: (title) => {
		return db.all('SELECT rowid, * FROM articles WHERE title = ?',
			title)
	},

	getTheTitle: (id) => {
		return db.all('SELECT title, * FROM articles WHERE rowid = ?',
			id)
	},

	count: () => {
		return db.all('SELECT COUNT(*) as nbrarticles FROM articles')
	},

	listWithPagination: (limitToShow, params) => {
		return db.all('SELECT *, rowid FROM articles LIMIT ? OFFSET ?',
			params.limit || limitToShow,
			params.offset || 0)
	},

// compteur de vus
	IncrementView: (title) =>{
	return redis.hget('Article:'+title, 'Vus').then((view) => {
			var vus = parseInt(view);
			vus += 1;
			return redis.hmset('Article:'+title, 'Vus', vus)
		})
	},

	GetView: (title)=>{
		return redis.hget('Article:'+title, 'Vus')
	}

}
