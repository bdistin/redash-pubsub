const rethink = require('rethinkdbdash');
const Topic = require('./Topic');

class Exchange {

	constructor(name, connOpts = {}) {
		connOpts.db = connOpts.db || 'pubsub';
		this.name = name;
		this.options = connOpts;
		this.db = rethink(connOpts);
		this.table = this.db.table(name);
		this._asserted = false;
	}

	createTopic(name) {
		return new Topic(this, name);
	}

	async publish(key, payload) {
		if (!this._asserted) await this.assertTable();
		key = typeof key === 'object' ? this.db.literal(key) : key;
		return await this.table.insert({
			id: key,
			updatedOn: this.db.now(),
			payload
		}, { conflict: 'update' });
	}

	async subscribe(filter) {
		if (!this._asserted) await this.assertTable();
		filter = typeof filter === 'object' ? filter : (key) => key.eq(filter);
		return await this.table.changes()('new_val').filter(row => filter(row('id')));
	}

	async assertTable() {
		if (this._asserted) return;
		await this.db.dbCreate(this.options.db)
			.catch((err) => {
				if (err.msg.indexOf('already exists') === -1) throw err;
			});
		await this.db.tableCreate(this.name)
			.catch((err) => {
				if (err.msg.indexOf('already exists') === -1) throw err;
			});
		this._asserted = true;
		return;
	}

}

module.exports = Exchange;
