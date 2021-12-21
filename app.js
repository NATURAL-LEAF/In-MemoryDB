 
const path = require('path');
const readline = require('readline');
const dbBackend = require(path.resolve('./dbBackend'));
const readInput = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

let db = new dbBackend();
console.log("\n" + "----------------------------------------- DATABASE INITIALISED -------------------------------------" + "\nEnter 'OPTIONS' to see all the features");

var transactionStarted = 0;
var transactionID = 1;

readInput.on('line', (input) => {
	let cmd = input.split(' ');
	cmd[0] = cmd[0].toUpperCase();
	let key;
	let value;

	if (cmd[0] != 'EXIT' && cmd[0] != 'DOWNLOAD' && cmd[0] != 'SHOWDB' && transactionStarted == 0 && cmd[0] !== 'BEGIN') {
		console.log("--ERROR : Start a Transaction first with the command 'BEGIN' before making changes to the DataBase !! \n--OR you can use 'SHOWDB' to read the Database or 'DOWNLOAD' to store the Database into secondary memory.");
		return;
	}
	if (cmd.length > 1) {
		key = cmd[1] || null;
		value = cmd[2] || null;
	}


	// let transactionIndex;
	switch (cmd[0]) {
		case 'SET':
			if (cmd.length != 3) {
				console.log("--Please provide correct SET input as:  SET <key> <value>");
				break;
			}
			db.set(key, value);
			break;
		case 'GET':
			if (cmd.length != 2) {
				console.log("--Please provide correct GET input as:  GET <key>");
				break;
			}
			db.get(key);
			break;
		case 'DELETE':
			if (cmd.length != 2) {
				console.log("--Please provide correct DELETE input as:  DELETE <key>");
				break;
			}
			db.delete(key);
			break;
		case 'COUNT':
			if (cmd.length != 2) {
				console.log("--Please provide correct COUNT input as:  COUNT <key>");
				break;
			}
			console.log("--Count : ", db.count(key), "\n");
			break;
		case 'BEGIN':
			transactionStarted = 1;
			console.log("~~~~Transaction with ID", transactionID, "Started~~~~\n");
			db.begin();
			break;
		case 'SHOWDB':
			db.showdb();
			break;
		case 'ROLLBACK':
			// transactionIndex = db.rollback();
			if (transactionID == 1) {
				console.log("--ERROR : Previous Data is not available for RollBack!! Make sure atleast 1 Transaction is already completed!\n");
				break;
			}

			db.rollback();
			transactionID--;
			console.log("--RollBack Successfull to the previous Transaction with ID", transactionID, ".");

			transactionStarted = 0;
			console.log("~~~~Transaction Reverted to last Transaction with ID", transactionID, "& Closed~~~~\n");
			transactionID++;

			// if (transactionIndex == -1) console.log('Transaction not found!!');
			// else console.log("Rolled back transaction with ID ", transactionIndex, "\n");
			// db.toggleTransactionMode();
			// db.transactionMode = true;

			break;

		// case 'oldCOMMIT':
		// 	// transactionIndex = db.commit();
		// 	db.commit();
		// 	// if ( transactionIndex == -1) console.log('Transaction not found!!');
		// 	// console.log("Commited to DB with Transaction ID as ", transactionIndex, "\n");
		// 	break;

		case 'DOWNLOAD':
			db.download();
			break;
		case 'LOAD':
			db.load();
			break;
		case 'COMMIT': // Previously END
			db.commit();
			console.log("--Committed the changes of this Transaction with ID", transactionID, "into the DataBase.\n");

			transactionStarted = 0;
			console.log("~~~~Transaction with ID", transactionID, "closed~~~~\n");
			transactionID++;
			// db.toggleTransactionMode();
			// db.transactionMode = true;
			break;
		case 'EXIT':
			transactionStarted = 0;
			readInput.close();
			console.log("\n" + "----------------------------------------- DATABASE CLOSED -------------------------------------\n");
			break;
		case 'OPTIONS':
			console.log('--Supported Features/Options: \n---SET <Key> <Val>\n' +
				'---GET <Key>\n---DELETE <Key>\n---COUNT <value>\n' +
				'---BEGIN\n---SHOWDB\n---ROLLBACK\n---COMMIT\n---EXIT\n');
			break;
		default:
			console.log('\n--ERROR : Invalid input ! Use "OPTIONS" to see all Possible Commands\n');
			break;
	}

	// db.manageState();


})
