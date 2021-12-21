const clone = require('clone');
const fs = require('fs');
const { finished } = require('stream');

module.exports = class myDB {
  constructor() {

    // Data

    // DATA WOULD BE LIKE [{},{},{}]
    // First Index would be Last Transaction saved DB, second would be Committed DB in current Transaction
    // and last index would be Non-committed DB in current Transaction.


    // IMPORTANT
    // Cannot Rollback after Commit so with Commit we actually END a Transaction.

    this.data = [{}, {}];
    this.tIndex = 1;

    this.treeData = [{}, {}];
    // Current Transaction index
    // this.tIndex = 0;
    this.anyChanges = false;
    // Transaction Mode indicator
    // this.transactionMode = false;

    // BASIC FUNCTIONS

    /* {@function} count - Returns the number of names that have the given value
     * assigned to them. If that value is not assigned anywhere, return 0
     * @params {String} value the unique identifier for the db search
     * @return {Number} the number of names tht have the given value
     */
    this.count = function (value) {
      let count = 0;
      value = this.huffmaned("xxCounTxx", value);   // Used to prevent function from updating treeData in case of "COUNT" use.
      let keysWithValue = [];
      if (value) {
        for (let property in this.data[this.tIndex]) {
          // console.log(property);
          if (this.data[this.tIndex].hasOwnProperty(property)) { // why?
            if (property && (this.data[this.tIndex][property] === value)) {
              keysWithValue.push(property);
              count++;
            }
          }
        }
        console.log("--Keys with same entered Value: ", keysWithValue);
      }

      return count;
    };

    /* {@function} Deletes the value from the database.
     * @params {String} name the unique identifier for the db lookup
     */
    this.delete = function (name) {
      // console.log('Hey Delete Called');

      if (name) {

        if (this.data[this.tIndex][name]) {
          console.log("--Data BEFORE DELETION - ", this.data[1]);
          // console.log("Encryption keys BEFORE DELETION - ", this.treeData, "\n");
          delete this.data[this.tIndex][name];
          delete this.treeData[1][name];
          console.log("--Data AFTER DELETION - ", this.data[1]);
          // console.log("Encryption keys AFTER DELETION - ", this.treeData, "\n");
          this.anyChanges = true;
        }
        else {
          console.log("--Error : KEY not Found !!! Enter 'SHOWDB' to see the stored KEYS \n");
        }
      }

      // console.log("after 1 - ", this.data[this.tIndex]);
      // console.log("after 2 - ", this.data[this.tIndex - 1]);
      // console.log("after 3 - ", this.treeData);
    };

    this.showdb = function () {
      console.log("--Committed Data: ", this.data[0]);
      if (this.anyChanges) {
        console.log("--UnCommitted Data: ", this.data[1]);
      }
      else {
        console.log("--UnCommitted Data: ", null);
      }
      // console.log(this.tIndex);
      // console.log(this.data);
      console.log("\n");
    }


    /* {@function} get - Returns the value for the given name.
     * If the value is not in the database, prints N ULL
     * @params name the unique identifier for the db lookup
     * @return {Object} the value for the given name
     */
    this.get = function (name) {
      var encoded = null;
      if (name) {
        encoded = this.data[this.tIndex][name];
      }
      var decoded = null;
      if (encoded != null) {
        console.log("--Stored Data: " + encoded);
        var enLen = encoded.length;
        if (encoded.charAt(enLen - 1) == 'x') {
          encoded = encoded.substring(0, enLen - 1);
          decoded = this.decode(this.treeData[1][name], encoded);
          let deLen = decoded.length;
          decoded = decoded.substring(0, deLen - 2);
        }
        else {
          decoded = this.decode(this.treeData[1][name], encoded);
        }
        // console.log("Decoded as:", decoded);
        console.log("--Decrypted Data: " + decoded + "\n");
      }
      if (decoded == null)
        console.log("--Error : KEY not Found !!! Enter 'SHOWDB' to see the stored KEYS");
    };






    /* {@function} set - Sets the name in the database to the given value
     * @params {String} name the unique identifier for the entry
     * @params {String} value the value for the given entry
     */
    this.set = function (name, value) {
      // let dataSet = this.data[this.tIndex];

      if (!this.data[this.tIndex]) {
        this.data[this.tIndex] = {};
      }

      let encryptedData = this.huffmaned(name, value);

      if (name && name.length > 0) {
        this.data[this.tIndex][name] = encryptedData || null;
      }
      console.log("--Data is Encrypted and Stored as: " + encryptedData + "\n")
      this.anyChanges = true;
    };

    // TRANSACTION FUNCTIONS

    /* {@function} begin - Begins a new transaction. Turns off auto-commit
     */
    this.begin = function () {
      // if (!this.transactionMode) {
      //   this.transactionMode = true;
      // }
      // Make sure stage and and main are in sync
      // this.data[this.tIndex + 1] = clone(this.data[this.tIndex]);
      // this.tIndex++;
      this.anyChanges = false;
      this.data[1] = clone(this.data[0]);
      this.treeData[1] = clone(this.treeData[0]);
      // this.data[2] = clone(this.data[0]);
      this.tIndex = 1;
    };

    /* {@function} commit - Commit all of the open transactions. Turns on auto-commit
      */

    this.commit = function () {
      // if (this.tIndex === 0) {
      //   this.transactionMode = false;
      // }
      // if (this.tIndex > 0) {
      //   // Sync Data from transaction
      //   this.data[this.tIndex - 1] = clone(this.data[this.tIndex]);
      //   // Clear out the transaction data
      //   // this.data[this.tIndex] = {};
      //   // Point to earlier version of data
      //   // this.tIndex--;
      // }
      // return this.tIndex - 1;

      this.data[0] = clone(this.data[1]);
      this.treeData[0] = clone(this.treeData[1]);
      this.anyChanges = false;
    };

    /* {@function} download - Downloads the content of DB into db_dump.txt
      * @return {Number} the new transaction index
      */

    this.download = function () {

      // Database data saving
      // var db_dump;
      // this.data.forEach((entry) => {
      //   db_dump = JSON.stringify(entry);
      // });
      // fs.writeFileSync("./files/encryptedDatabase.json", db_dump);
      // console.log("------- Saved Database to database.json -------\n");

      var db_dump = JSON.stringify(this.data[0]);
      fs.writeFileSync("./files/encryptedDatabase.json", db_dump, 'utf-8');
      console.log("------- Saved Database to ./files/encryptionDatabase.json -------\n");

      // Tree or decodeKey saving
      var tree_dump = JSON.stringify(this.treeData[0]);
      fs.writeFileSync('./files/encryptionKeys.json', tree_dump, 'utf-8');

      console.log("------- Stored Encryption Keys to ./files/encryptionKeys.json -------\n");

    }


    /* {@function} load - loads the content of encryptedDatabase.json into RAM/app
          * @return {Number} the new transaction index
          */

    // this.setData = function (error, fdata) {
    //   setTimeout(function () {
    //     textData = JSON.parse(fdata);
    //   }, 3000);
    // }

    // this.setKeyData = function (error, fdata) {
    //   setTimeout(function (this) {
    //     textEncryptKeys = JSON.parse(fdata);
    //   }, 3000);
    // }
    this.load = function () {

      //working on this

    //   var textData = Object.create(null);
    //   fs.readFile("./files/encryptedDatabase.json", "utf-8", setData(error, fdata).bind(this));



    //   setTimeout(function (this) {
    //     this.data[0] = clone(textData);
    //   }, 3000);

    //   var textEncryptKeys = Object.create(null);
    //   fs.readFile("./files/encryptionKeys.json", "utf-8", setKeyData(error, fdata).bind(this));


    //   setTimeout(function (this) {
    //     this.treeData[0] = clone(textEncryptKeys);
    //   }, 3000);

    //   setTimeout(function (this) {
    //     this.begin();
        console.log("------- Loaded Database into the Main Memory -------\n");
    //     this.showdb();
    //   }, 3000);
    }


    /* {@function} rollback - Rolls back the most recent transaction.
      * @return {Number} the new transaction index
    \\
      */
    this.rollback = function () {
      // if (this.tIndex === 0) {
      //   return -1;
      // }
      // if (this.transactionMode) {
      //   // this.data.pop()
      //   this.data[this.tIndex] = {};
      //   this.tIndex--;
      // }
      // return this.tIndex;

      this.data[1] = clone(this.data[0]);
      this.treeData[1] = clone(this.treeData[0]);
      this.anyChanges = false;
    }

    /* {@function} manageState - Auxilary function to manage state between
      * transactionMode(auto-commit-off) and regular(auto-commit-on) mode
      */
    this.manageState = function () {

      if (!this.transactionMode) {
        // commit immediately
        console.log("--Called: ", this.transactionMode);
        this.data[0] = clone(this.data[this.tIndex]);
      }
    }


    this.toggleTransactionMode = function () {
      if (!this.transactionMode) {
        this.transactionMode = true;
      }
      else
        this.transactionMode = false;
    }

    ////////////////////////////////////////
    ///////////////////////////////////////
    //Huffman

    this.code = {};
    this.pat = '';

    this.huffmaned = function (name, value) {
      var freqs = this.frequency(value);
      var singleCase = 0;
      if (Object.keys(freqs).length == 1) {
        singleCase = 1;
        value += "az";
        freqs = this.frequency(value);
        // this.singleCase = 1;
      }

      var tuples = this.sortfreq(freqs);
      tuples = this.buildtree(tuples);
      var tree = this.buildTree(tuples);

      this.assignCode(tree, this.pat);

      var encoded = this.encode(value);

      if (name != "xxCounTxx")        // Used to prevent function from updating treeData in case of "COUNT" use.
        this.treeData[1][name] = tree;

      if (singleCase == 1) {
        encoded = encoded + 'x';
        singleCase = 0;
      }

      // console.log("Encoded as:", encoded);

      return encoded;
    }



    this.codes = {};
    // this.singleCase = 0;

    // to count Frequency of each character in string 

    this.frequency = function (str) {
      var freqs = {};
      for (var i in str) {

        if (freqs[str[i]] == undefined) {

          freqs[str[i]] = 1;
        }
        else {
          freqs[str[i]] = freqs[str[i]] + 1;
        }
      }

      return freqs;
    }



    // Assigning codes to characters
    this.sortfreq = function (freqs) {
      var tuples = [];
      for (var let1 in freqs) {
        tuples.push([freqs[let1], let1]);
      }
      return tuples.sort();
    }



    this.buildtree = function (tuples) {
      while (tuples.length > 1) {
        var leasttwo = [tuples[0][1], tuples[1][1]];
        //console.log(leasttwo);
        var rest = tuples.slice(2, tuples.length);
        //console.log(rest);
        var combfreq = tuples[0][0] + tuples[1][0];
        //console.log(combfreq);
        tuples = rest;
        var end = [combfreq, leasttwo];
        //console.log(end);
        tuples.push(end)
        tuples.sort();
      }
      return tuples;
    }




    // Build Tree
    this.buildTree = function (tuples) {
      while (tuples.length > 1) {
        var leastTwo = [tuples[0][1], tuples[1][1]]
        //console.log(leastTwo);  
        var theRest = tuples.slice(2, tuples.length);
        //console.log(theRest);  
        var combFreq = tuples[0][0] + tuples[1][0];
        //console.log(combFreq);  
        tuples = theRest;
        var end = [combFreq, leastTwo];
        tuples.push(end);
        //console.log(tuples);  
        tuples.sort();
        //console.log(tuples);  
      }
      return tuples[0][1];

    }


    //assiging codes to each letter  
    this.assignCode = function (node, pat) {
      if (typeof (node) == typeof (""))
        this.code[node] = pat;
      else {
        this.assignCode(node[0], pat + '0');
        this.assignCode(node[1], pat + '1');
      }
    }

    // console.log("Input String is: ", string + "\n");

    //encoding given string  
    this.encode = function (string) {
      var output = '';
      for (var s in string)
        output += this.code[string[s]];
      return output;
    }


    // Decoding given string
    this.decode = function (tree, encoded) {
      var output = '';
      var p = tree;
      for (var bit in encoded) {
        if (encoded[bit] == '0')
          p = p[0];
        else
          p = p[1];
        if (typeof (p) == typeof ('')) {
          output += p;
          p = tree;
        }
      }
      return output;
    }

  }

};
// { a: '1' },
// { a: '1', b: '2' },
// { a: '1', b: '2', c: '3' },
// { a: '1', b: '2', c: '3' }
// 
// # doing rollback
// { a: '1' },
// { a: '1', b: '2' },
// { a: '1', b: '2' },