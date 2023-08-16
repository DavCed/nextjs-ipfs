import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { Loader } from "../loader";
import { WEB3_CLIENT, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function StoreFile() {
  const { runContractFunction } = useWeb3Contract();
  const [storeFieldMessage, setStoreFieldMessage] = useState("");
  const [folderCidField, setFolderCidField] = useState("");
  const [fileCidField, setFileCidField] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* STORE FILES IN WEB3 STORAGE IPFS */
  async function storeFilesInIPFS(files) {
    const cidWeb3 = await WEB3_CLIENT.put(files);
    const folderUrlWeb3 = `https://dweb.link/ipfs/${cidWeb3}`;
    console.log(`FOLDER URL (storeFiles) => ${folderUrlWeb3}`);
    return {
      cid: cidWeb3.toString(),
      url: folderUrlWeb3,
    };
  }

  /* CONSTRUCT FILES ARRAY */
  async function constructFilesArr(dataObj) {
    let filesArr = [];
    const response = await WEB3_CLIENT.get(dataObj.cid);
    const web3Files = await response.files();
    for (const web3File of web3Files) {
      filesArr.push({
        cid: web3File.cid,
        url: `https://${web3File.cid}.ipfs.dweb.link/`,
      });
    }
    console.log(filesArr);
    return filesArr;
  }

  /* STORE FILES */
  async function storeFiles() {
    const files = await document.getElementById("files").files;
    console.log("FILES ARRAY => ", files);
    if (files.length === 0) {
      setFolderCidField("");
      setFileCidField("");
      setFiles([]);
      setStoreFieldMessage("Please select files");
    } else {
      setIsLoading(false);
      const dataObj = await storeFilesInIPFS(files);
      const filesArr = await constructFilesArr(dataObj);
      setFolderCidField("Folder CID: " + dataObj.cid);
      setFileCidField("Files CIDs: ");
      setFiles(filesArr);
      await storeFilesOnChain(filesArr);
      setStoreFieldMessage("");
    }
  }

  /* STORE FILES ON BLOCKCHAIN */
  async function storeFilesOnChain(fileArr) {
    const storeFilesOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "storeFiles",
      params: {
        files: fileArr,
      },
    };
    setIsLoading(true);
    await runContractFunction({
      onSuccess: (results) => {
        console.log("TRANSACTION OBJECT (storeFiles) => ", results);
        setStoreFieldMessage(`Successfully stored files! ${results.hash}`);
      },
      onError: (error) => {
        console.log(`ERROR => ${error.message}`);
        setStoreFieldMessage(error.message);
      },
      onComplete: () => {
        document.getElementById("files").value = "";
      },
      params: storeFilesOptions,
    });
  }

  return (
    <div>
      <h4>{storeFieldMessage}</h4>
      <div>
        <div>
          <input type="file" id="files" multiple />
        </div>
        <p>{folderCidField}</p>
        <div>
          <p>{fileCidField}</p>
          {files.map((file, index) => (
            <p key={index}>{file.cid}</p>
          ))}
        </div>
        <div hidden={isLoading}>
          <Loader />
        </div>
        <button onClick={() => storeFiles()}>Store Files</button>
      </div>
    </div>
  );
}
