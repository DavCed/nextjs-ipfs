import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetAll() {
  const { runContractFunction } = useWeb3Contract();
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");
  const [files, setFiles] = useState([]);

  function getAllFilesOnChain() {
    /* GET ALL FILES IN SMART CONTRACT ON BLOCKCHAIN */
    const getAllFilesOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getAllFiles",
    };
    runContractFunction({
      onSuccess: async (results) => {
        console.log("All Files (getAllFiles) => ");
        results
          .map(async (file, index) => {
            const res = await fetch(file.url);
            const studentObj = await res.json();
            console.log(
              `${index} - CID: ${file.cid} URL: ${
                file.url
              } STUDENT: ${JSON.stringify(studentObj)}`
            );
          })
          .push("cid", "url");
        setFiles(results);
        console.log(results);
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
        </div>
        {files.map((file, index) => (
          <div key={++index}>
            <h4>File #{++index}</h4>
            <p>CID : {file.cid}</p>
            <p>
              URL :{" "}
              <a href={file.url} target="_blank">
                {file.url}
              </a>
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
