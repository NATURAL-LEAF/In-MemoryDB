codes = {};
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var string = "";

rl.question("Please enter a String : ", function (answer) {
    string = answer + "";
    work(string);
    rl.close();
});

// to count Frequency of each character in string 
function work(str) {
    singleCase = 0;
    function frequency(str) {
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
    freqs = frequency(string);
    // console.log(freqs);
    if (Object.keys(freqs).length == 1) {
        string += "az";
        freqs = frequency(string);
        singleCase = 1;
    }

    // Assigning codes to characters
    function sortfreq(freqs) {
        var tuples = [];
        for (var let in freqs) {
            tuples.push([freqs[let], let]);
        }
        return tuples.sort();
    }

    tuples = sortfreq(freqs);

    function buildtree(tuples) {
        while (tuples.length > 1) {
            var leasttwo = [tuples[0][1], tuples[1][1]];
            //console.log(leasttwo);
            var rest = tuples.slice(2, tuples.length);
            //console.log(rest);
            var combfreq = tuples[0][0] + tuples[1][0];
            //console.log(combfreq);
            tuples = rest;
            end = [combfreq, leasttwo];
            //console.log(end);
            tuples.push(end)
            tuples.sort();
        }
        return tuples;
    }
    tuples = buildtree(tuples);



    // Build Tree
    function buildTree(tuples) {
        while (tuples.length > 1) {
            leastTwo = [tuples[0][1], tuples[1][1]]
            //console.log(leastTwo);  
            theRest = tuples.slice(2, tuples.length);
            //console.log(theRest);  
            combFreq = tuples[0][0] + tuples[1][0];
            //console.log(combFreq);  
            tuples = theRest;
            end = [combFreq, leastTwo];
            tuples.push(end);
            //console.log(tuples);  
            tuples.sort();
            //console.log(tuples);  
        }
        return tuples[0][1];

    }
    tree = buildTree(tuples);
    //console.log(tree);


    code = {};
    pat = '';
    //assiging codes to each letter  
    function assignCode(node, pat) {
        if (typeof (node) == typeof (""))
            code[node] = pat;
        else {
            assignCode(node[0], pat + '0');
            assignCode(node[1], pat + '1');
        }
    }
    assignCode(tree, pat);

    // console.log("Input String is: ", string + "\n");

    //encoding given string  
    function encode(string) {
        output = '';
        for (s in string)
            output += code[string[s]];
        return output;
    }

    encoded = encode(string);
    console.log("Encoded as:", encoded);
    //10011101100111010(malayalam)  

    // Decoding given string
    function decode(tree, encoded) {
        output = '';
        p = tree;
        for (bit in encoded) {
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

    decoded = decode(tree, encoded);

    if (singleCase == 1) {
        singleCase = 0;
        decoded = decoded.substring(0, 1);
    }

    console.log("Decoded as:", decoded);
}