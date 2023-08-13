import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { WEB3_CLIENT, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetAll() {
  const { runContractFunction } = useWeb3Contract();
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  let allFiles = [];

  /* GET EACH FILE FROM WEB3 STORAGE IPFS */
  async function getSingleFileFromIPFS(cid) {
    const response = await WEB3_CLIENT.get(cid);
    const web3Files = await response.files();
    const studentObj = JSON.parse(await web3Files[0].text());
    return studentObj;
  }

  /* GET EACH FILE IN FOLDER FROM WEB3 STORAGE IPFS */
  async function getMultipleFilesFromIPFS(cid) {
    let studentObjArr = [];
    let studentCidArr = [];
    let index = 1;
    const response = await WEB3_CLIENT.get(cid);
    const web3Files = await response.files();
    for (const web3File of web3Files) {
      studentCidArr.push(web3File.cid);
      index++;
      studentObjArr.push(JSON.parse(await web3File.text()));
    }
    return { studentCidArr: studentCidArr, studentObjArr: studentObjArr };
  }

  /* GET EACH OBJECT KEY/VALUE FIELD IN ARRAY */
  function getStudentObjectArray(studentObj) {
    let studentArr = [];
    for (let [key, value] of Object.entries(studentObj)) {
      studentArr.push(
        key.charAt(0).toUpperCase() + key.substring(1) + ": " + value
      );
    }
    return studentArr;
  }

  /* GET ALL FILES IN SMART CONTRACT ON BLOCKCHAIN */
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

  /* PRINT ALL FILES FETCHED */
  function printFiles(filesOnChain) {
    filesOnChain.map(async (file) => {
      if (file.url === `https://dweb.link/ipfs/${file.cid}`) {
        const studentDataObjArr = await getMultipleFilesFromIPFS(file.cid);
        for (const objPos in studentDataObjArr.studentObjArr) {
          const studentArr = getStudentObjectArray(
            studentDataObjArr.studentObjArr[objPos]
          );
          allFiles.push({
            cid: studentDataObjArr.studentCidArr.at(objPos),
            // url: `https://${studentDataObjArr.studentCidArr.at(
            //   objPos
            // )}.ipfs.dweb.link/`,
            data: studentArr,
          });
        }
      } else {
        const studentObj = await getSingleFileFromIPFS(file.cid);
        const studentArr = getStudentObjectArray(studentObj);
        allFiles.push({ cid: file.cid, url: file.url, data: studentArr });
      }
      setFiles(allFiles);
      setCount(allFiles.length);
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
