import { abi, contractAddress } from "../constants/config";
import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";

export function GetAll() {
  const { runContractFunction } = useWeb3Contract();
  const [getAllFieldMessage, setGetAllFieldMessage] = useState("");
  const [files, setFiles] = useState([]);

  function getAllFilesOnChain() {
    /* GET ALL FILES IN SMART CONTRACT ON BLOCKCHAIN */
    const getAllFilesOptions = {
      abi: abi,
      contractAddress: contractAddress,
      functionName: "getAllFiles",
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log("All Files (getAllFiles) => ");
        results.map((file, index) =>
          console.log(`${index} - CID: ${file.cid} URL: ${file.url}`)
        );
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
    <div>
      <div>{getAllFieldMessage}</div>
      <div>
        <button onClick={() => getAllFilesOnChain()}>Get All Files</button>
      </div>
      {files.map((file, index) => (
        <div key={++index}>
          <h4>File #{++index}</h4>
          <p>CID : {file.cid}</p>
          <p>URL : {file.url}</p>
        </div>
      ))}
    </div>
  );
}
