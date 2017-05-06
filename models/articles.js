const db = require('sqlite')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const Session = require('../models/sessions')


function timeConverter(UNIX_timestamp){
	return moment(UNIX_timestamp).format("DD-MM-YYYY h:mm:ss")
}


module.exports = {

// fonctions principales
insert: (params) => {
	var date = timeConverter(Date.now());
	return db.run('INSERT INTO articles (title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
		params.title,
		params.content,
		date,
		date)
},

	update: (body, params, samePwd) => {
		if (samePwd) var pwd = body.pwd
		else var pwd = bcrypt.hashSync(body.pwd)
		return db.all('UPDATE articles SET title = ?, content = ?, updatedAt = ? WHERE rowid = ?',
			body.title,
			body.content,
			timeConverter(Date.now()),
			params.userId)
	},

	delete: (userId) => {
		return db.all('DELETE FROM articles WHERE rowid = ?',
			userId)
	},

// getters
	getId: (accessToken) => {
		return Session.exists(accessToken).then((result) => {
			return result.userId
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

	count: () => {
		return db.all('SELECT COUNT(*) as nbrarticles FROM articles')
	},

	listWithPagination: (limitToShow, params) => {
		return db.all('SELECT *, rowid FROM articles LIMIT ? OFFSET ?',
			params.limit || limitToShow,
			params.offset || 0)
	}


}
