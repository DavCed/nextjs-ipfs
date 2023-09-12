import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetFile() {
  const { runContractFunction } = useWeb3Contract();
  const [getFieldMessage, setGetFieldMessage] = useState("");
  const [getFieldOutput, setGetFieldOutput] = useState([]);

  /* GET FILE FROM WEB3 STORAGE IPFS */
  async function getFileFromIPFS(url) {
    const res = await fetch(url);
    const studentObj = await res.json();
    console.log("STUDENT OBJECT (getFile) => ", studentObj);
    return studentObj;
  }

  /* SET OUTPUT DATA ON UI */
  function printOutput(student) {
    const currDate = new Date();
    const date =
      currDate.getFullYear() +
      "-" +
      (currDate.getMonth() + 1) +
      "-" +
      currDate.getDate() +
      " " +
      currDate.getHours() +
      ":" +
      currDate.getMinutes() +
      ":" +
      currDate.getSeconds();
    let studentArr = [];
    for (let [key, value] of Object.entries(student)) {
      studentArr.push(
        key.charAt(0).toUpperCase() + key.substring(1) + ": " + value
      );
    }
    studentArr.push("Digital Signature: signature");
    studentArr.push("Issued At: " + date);
    setGetFieldOutput(studentArr);
  }

  /* GET FILE WITH CID VALUE */
  async function getFileByCID() {
    document.getElementById("cid").value.length > 0
      ? await getFileOnChain(document.getElementById("cid").value)
      : setGetFieldMessage("CID is required");
    setGetFieldOutput([]);
  }

  /* GET FILE ON BLOCKCHAIN */
  async function getFileOnChain(cid) {
    const getFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getFile",
      params: {
        cid: cid,
      },
    };
    await runContractFunction({
      onSuccess: async (results) => {
        console.log(`FILE URL (getFile) => ${results}`);
        if (results.length === 0) {
          setGetFieldMessage("No file stored");
          setGetFieldOutput([]);
        } else {
          const studentObj = await getFileFromIPFS(results);
          printOutput(studentObj);
          setGetFieldMessage("");
        }
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetFieldMessage(error);
        setGetFieldOutput([]);
      },
      params: getFileOptions,
    });
  }

  return (
    <>
      <br />
      <div>
        <div>
          <h4>{getFieldMessage}</h4>
        </div>
        <div>
          <label>CID: </label>
          <input type="text" id="cid" size={60} />
        </div>
        <div>
          {getFieldOutput.map((ele, index) => (
            <p key={index}>{ele}</p>
          ))}
        </div>
        <div>
          <button onClick={() => getFileByCID()}>Get File</button>
        </div>
      </div>
    </>
  );
}
