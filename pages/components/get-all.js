import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { WEB3_CLIENT, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetAll() {
  const { runContractFunction } = useWeb3Contract();
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  let allFiles = [];

  /* GET FILE FROM WEB3 STORAGE IPFS */
  async function getFileFromIPFS(cid) {
    const response = await WEB3_CLIENT.get(cid);
    const web3Files = await response.files();
    const studentObj = JSON.parse(await web3Files[0].text());
    return studentObj;
  }

  /* GET OBJECT KEY/VALUE FIELDS IN ARRAY */
  function getStudentObjectArray(studentObj) {
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
    for (let [key, value] of Object.entries(studentObj)) {
      studentArr.push(
        key.charAt(0).toUpperCase() + key.substring(1) + ": " + value
      );
    }
    studentArr.push("Digital Signature: signature");
    studentArr.push("Issued At: " + date);
    return studentArr;
  }

  /* PRINT ALL FILES FETCHED */
  function printFiles(filesOnChain) {
    filesOnChain.map(async (file) => {
      const studentObj = await getFileFromIPFS(file.cid);
      const studentArr = getStudentObjectArray(studentObj);
      allFiles.push({ cid: file.cid, url: file.url, data: studentArr });
      setFiles(allFiles);
      setCount(allFiles.length);
    });
  }

  /* GET FILES ON BLOCKCHAIN */
  async function getAllFilesOnChain() {
    const getAllFilesOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getAllFiles",
    };
    await runContractFunction({
      onSuccess: (results) => {
        console.log("ALL FILES (getAllFiles) => ", results);
        if (results.length === 0) {
          setFiles([]);
          setCount(0);
        } else printFiles(results);
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetAllFieldMessage(error);
      },
      params: getAllFilesOptions,
    });
  }

  return (
    <>
      <br />
      <div>
        <div>{getAllFieldMessage}</div>
        <div>
          <button onClick={() => getAllFilesOnChain()}>Get All Files</button>
          <h2>{count} files fetched</h2>
        </div>
        {files.map((file, index) => (
          <div key={++index}>
            <h4>File #{++index}</h4>
            <p>CID : {file.cid}</p>
            {/* <p>
              URL :{" "}
              <a href={file.url} target="_blank">
                {file.url}
              </a>
            </p> */}
            <div>
              {file.data.map((ele, index) => (
                <p key={index}>{ele}</p>
              ))}
            </div>
            {files.length - 1 !== --index && <br />}
          </div>
        ))}
      </div>
    </>
  );
}
