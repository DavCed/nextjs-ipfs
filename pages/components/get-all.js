import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetAll() {
  const { runContractFunction } = useWeb3Contract();
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");
  const [files, setFiles] = useState([]);

  /* GET ALL FILES IN SMART CONTRACT ON BLOCKCHAIN */
  function getAllFilesOnChain() {
    const getAllFilesOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getAllFiles",
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log("All Files (getAllFiles) => ");
        results.map((file) => console.log(`CID: ${file.cid} URL: ${file.url}`));
        setFiles(results);
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
