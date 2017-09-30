class Topic {

	constructor(exchange, topicKey) {
		this.exchange = exchange;
		this.key = topicKey;
	}

	publish(payload) {
		return this.exchange.publish(this.key, payload);
	}

}

module.exports = Topic;
