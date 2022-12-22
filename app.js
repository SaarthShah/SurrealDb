import Surreal from 'surrealdb.js';

const db = new Surreal('http://127.0.0.1:8000/rpc');

async function main() {

    await db.wait();

    console.log('Logging in...');

    let token = await db.signin({
        user: 'root',
        pass: 'root'
    });

    console.log('Logged in!',token);

    await db.use('test','test');


    let data = await db.query("SELECT * FROM users");
    console.log(data);

    console.log(
        data[0]['result']
    )

    let x = await db.query('DELETE users:test2')

    console.log(x);
}

main();