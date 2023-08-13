import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { WEB3_CLIENT, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetFile() {
  const { runContractFunction } = useWeb3Contract();
  const [getFieldMessage, setGetFieldMessage] = useState("");
  const [getFieldOutput, setGetFieldOutput] = useState([]);

  /* GET SINGLE FILE FROM WEB3 STORAGE IPFS */
  async function getSingleFileFromIPFS(url) {
    const res = await fetch(url);
    const studentObj = await res.json();
    console.log("STUDENT OBJECT (getFile) => ", studentObj);
    return studentObj;
  }

  /* GET MULTIPLE FILES FROM WEB3 STORAGE IPFS */
  async function getMultipleFilesFromIPFS(cid) {
    let studentObjArr = [];
    const response = await WEB3_CLIENT.get(cid);
    const web3Files = await response.files();
    for (const web3File of web3Files) {
      studentObjArr.push(await web3File.text());
    }
    return studentObjArr;
  }

  /* SET OUTPUT DATA ON UI */
  function printOutput(student) {
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
    setGetFieldOutput([]);
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
    await runContractFunction({
      onSuccess: async (results) => {
        console.log(`FILE URL (getFile) => ${results}`);
        if (results.length === 0) {
          setGetFieldMessage("No file stored");
          setGetFieldOutput([]);
        } else {
          if (results === `https://dweb.link/ipfs/${cid}`) {
            const studentObjArr = await getMultipleFilesFromIPFS(cid);
            setGetFieldOutput(studentObjArr);
          } else {
            const studentObj = await getSingleFileFromIPFS(results);
            printOutput(studentObj);
          }
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
