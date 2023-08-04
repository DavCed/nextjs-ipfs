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

  /* GET FILE IN SMART CONTRACT ON BLOCKCHAIN */
  async function getFileOnChain(cid) {
    const getFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getFile",
      params: {
        cid: cid,
      },
    };
    runContractFunction({
      onSuccess: async (results) => {
        console.log(`FILE URL (getFile) => ${results}`);
        const studentObj = await getFileFromIPFS(results);
        setGetFieldMessage("");
        setOutputInGetField(studentObj);
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetFieldMessage(error);
        setGetFieldOutput([]);
      },
      params: getFileOptions,
    });
  }

  /* SET OUTPUT DATA ON UI */
  function setOutputInGetField(student) {
    let studentArr = [];
    for (let [key, value] of Object.entries(student)) {
      studentArr.push(
        key.charAt(0).toUpperCase() + key.substring(1) + ": " + value
      );
    }
    setGetFieldOutput(studentArr);
  }

  /* GET FILE WITH CID VALUE */
  async function getFileByCID() {
    document.getElementById("cid").value.length > 0
      ? await getFileOnChain(document.getElementById("cid").value)
      : setGetFieldMessage("CID is required");
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
