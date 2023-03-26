import "./App.css";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
  let initialTemplate = JSON.stringify(
    {
      min_position: "int(3,4,5-9)",
      has_more_items: "bool",
      items_html: "string(Bus,Car,Bike)",
      new_latent_count: "int",
      data: {
        length: "int(20-30)",
        text: "string",
      },
      numericalArray: ["repeat[5]", "int(20,23-33)"],
      StringArray: ["repeat[4]", "string(Carbon,Nitrogen,Oxygen)"],
      multipleTypesArray: [3, "Hello", 5, true],
      objArray: [
        "repeat[5]",
        {
          class: "string(middle,upper,lower)",
          age: "int",
        },
      ],
    },
    undefined,
    4
  );

  const [data, setData] = useState(initialTemplate);
  const [output, setOutput] = useState("");
  const [copies, setCopies] = useState("1");
  const [recordNum, setrecordNum] = useState("1");
  const [recordArray, setrecordArray] = useState([]);

  useEffect(() => showOutput(), [recordNum, recordArray]);

  function showOutput() {
    console.log(recordNum);
    setOutput(JSON.stringify(recordArray[recordNum - 1], undefined, 4));
  }

  function toggleOutput(index) {
    console.log(typeof index, typeof recordNum);
    let value = parseInt(recordNum) + parseInt(index);
    if (value < 1) value = 1;
    else if (value > recordArray.length) value = recordArray.length;
    setrecordNum(value);
  }

  function downloadFile() {
    if (output.length == 0) {
      alert("Please Generate Data to Download");
      return;
    }
    let zip = new JSZip();
    for (let i = 0; i < recordArray.length; i++) {
      zip.file(
        `Record-${i + 1}.txt`,
        JSON.stringify(recordArray[i], undefined, 4)
      );
    }
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, "Records.zip");
    });
    // let file = new Blob([output], { type: "text/plain" });
    // element.href = URL.createObjectURL(file);
    // element.download = "JSON-data.txt";
    // document.body.appendChild(element);
    // element.click();
  }

  function validateInput() {
    try {
      let parsedInput = JSON.parse(data);
      let outputArray = [];
      for (let i = 0; i < parseInt(copies); i++) {
        outputArray.push(processInput(parsedInput));
      }
      setrecordArray(outputArray);
      //setOutput(JSON.stringify(outputArray[copies - 1], undefined, 4));
      // showOutput();
      setrecordNum(1);
      console.log(outputArray);
      //console.log(processArray([3, "Hello", 5, true]));
    } catch (error) {
      console.log(error.message);
    }
  }
  //JSON.stringify(myJsObj, undefined, 4);

  function processInput(input) {
    let finalOutput = {};
    for (let key in input) {
      if (input[key] instanceof Array) {
        finalOutput[key] = processArray(input[key]);
      } else if (input[key] instanceof Object) {
        finalOutput[key] = processObject(input[key]);
      } else if (input[key] == "bool") {
        finalOutput[key] = Math.random() < 0.5;
      } else if (input[key] == "int") {
        finalOutput[key] = Math.floor(Math.random() * 10);
      } else {
        finalOutput[key] = generateArray(input[key], 1)[0];
      }
    }
    return finalOutput;
  }

  function processArray(input) {
    //console.log(typeof input[0]);
    let pattern = /repeat\[\d+\]/;
    if (pattern.test(input[0])) {
      //console.log(input[Math.floor(Math.random() * input.length)]);
      let limit = parseInt(
        input[0].slice(input[0].indexOf("[") + 1, input[0].indexOf("]"))
      );
      if (input[1] instanceof Object) {
        let output = [];
        for (let i = 0; i < limit; i++) {
          output.push(processObject(input[1]));
        }
        return output;
      }
      //console.log(limit, input[0][7]);
      return generateArray(input[1], limit);
    }
    return input[Math.floor(Math.random() * input.length)];
  }

  function generateArray(input, count) {
    let finalArray = [];
    let ans = [];
    if (input.includes("int")) {
      let valueArray = input
        .slice(input.indexOf("(") + 1, input.length - 1)
        .split(",");

      for (let i = 0; i < valueArray.length; i++) {
        //console.log(numbers);
        if (valueArray[i].includes("-")) {
          for (
            let j = parseInt(
              valueArray[i].slice(0, valueArray[i].indexOf("-"))
            );
            j <=
            parseInt(
              valueArray[i].slice(
                valueArray[i].indexOf("-") + 1,
                valueArray[i].length
              )
            );
            j++
          ) {
            finalArray.push(j);
          }
        } else {
          finalArray.push(parseInt(valueArray[i]));
        }
      }
      //console.log(numbers);
    } else if (input.includes("string")) {
      finalArray = input
        .slice(input.indexOf("(") + 1, input.length - 1)
        .split(",");
      //console.log(input.slice(input.indexOf("(") + 1, input.length - 1));
    } else {
      for (let i = 0; i < count; i++) {
        ans.push(processInput(input));
      }
      return ans;
    }

    for (let i = 0; i < count; i++) {
      ans.push(finalArray[Math.floor(Math.random() * finalArray.length)]);
    }
    return ans;
  }
  function processObject(input) {
    let finalObject = {};
    let skip = false;
    for (let key in input) {
      if (skip) {
        skip = false;
      } else if (key == "length") {
        let min = parseInt(
          input[key].slice(input[key].indexOf("(") + 1, input[key].indexOf("-"))
        );
        let max = parseInt(
          input[key].slice(input[key].indexOf("-") + 1, input[key].indexOf(")"))
        );
        let len = Math.floor(Math.random() * (max - min) + min);

        let dataArray = [];
        for (let i = 0; i < len; i++) {
          dataArray.push(
            Math.random()
              .toString(36)
              .substring(2, Math.floor(Math.random() * (10 - 4) + 4))
          );
        }
        skip = true;
        //console.log(len, dataArray.join(" "));
        finalObject[key] = len;
        finalObject["text"] = dataArray.join(" ");
        //console.log(finalObject["text"], dataArray.join(" "));
      } else if (input[key] == "bool") {
        finalObject[key] = Math.random() < 0.5;
      } else if (input[key] == "int") {
        finalObject[key] = Math.floor(Math.random() * 10);
      } else {
        finalObject[key] = generateArray(input[key], 1)[0];
      }
      //console.log(input[key], key);
    }
    return finalObject;
  }

  return (
    <>
      <div className="container">
        <div>
          <label>Please Enter Number of Copies </label>
          <input
            type="text"
            value={copies}
            onChange={(event) => setCopies(event.target.value)}
          />
        </div>
        <div className="box-container">
          <textarea
            name=""
            id="input-box"
            className="box"
            value={data}
            onChange={(event) => setData(event.target.value)}
          ></textarea>
          <div>
            <textarea
              readOnly
              name=""
              id="input-box"
              className="box"
              value={output}
            ></textarea>
            <div className="toggle-record-container">
              <button onClick={() => toggleOutput(-1)}>Prev</button>
              <input
                type="text"
                value={recordNum}
                onChange={(event) => setrecordNum(() => event.target.value)}
                readOnly
              />
              <button onClick={() => toggleOutput(+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
      <div className="button">
        <button onClick={() => validateInput()}>generate</button>
        <button>clear</button>
        <button onClick={() => downloadFile()}>download</button>
      </div>
    </>
  );
}

export default App;
