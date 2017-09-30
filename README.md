## redash-pubsub

Implimentation of https://www.rethinkdb.com/docs/publish-subscribe/javascript/ with some key differences.

* This implimentation uses [rethinkdbdash](https://github.com/neumino/rethinkdbdash)
* `Exchange.subscribe(filter)` returns a [curser](https://www.rethinkdb.com/docs/changefeeds/javascript/) and therefore can be handled with your own callback using `cursor.every(callback)` or event listeners using `cursor.on('data', handler)` and `cursor.on('error', handler)`
* New topics are created with `Exchange.createTopic(key)` allowing you to simply use `topic.publish(payload)`

```javascript
const { Exchange } = require('redash-pubsub'); // soon(tm)

// options parameter shown with default options
const client = new Exchange('myPubSub', { db: 'pubsub', host: 'localhost', port: 28015 }); 

const testTopic = client.createTopic('test');

// Filter can be a rethink filter function, or a string
client.subscribe('test')
    .then(cursor => {
        cursor.on('data', data => {
            console.log(data); // { id: 'test', payload: { some: 'object' }, updatedOn: dateObject }
        });

        cursor.on('error', err => {
            console.error(err); // If some error happens
        });

        /**************/
        /* Optionally */
        /**************/

        cursor.every((err, data) => {
            if (err) return console.error(err);
            console.log(data);
        });
    });

// Publish to our topic
testTopic.publish({ some: 'object' }).catch(console.error);

/**************/
/* Optionally */
/**************/

client.publish('test', { some: 'object' }).catch(console.error);
```