import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { Loader } from "../loader";
import { WEB3_CLIENT, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function StoreFile() {
  const { runContractFunction } = useWeb3Contract();
  const [storeFieldMessage, setStoreFieldMessage] = useState("");
  const [folderCidField, setFolderCidField] = useState("");
  const [fileCidField, setFileCidField] = useState("");
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* STORE IN WEB3 STORAGE IPFS SINGLE FILE */
  async function storeSingleFileIPFS(file) {
    const cidWeb3 = await WEB3_CLIENT.put([file]);
    const fileUrlWeb3 = `https://${cidWeb3}.ipfs.dweb.link/${file.name}`;
    console.log(`FILE URL (storeSingleFile) => ${fileUrlWeb3}`);
    return {
      cid: cidWeb3.toString(),
      url: fileUrlWeb3,
    };
  }

  /* STORE IN WEB3 STORAGE IPFS MULTIPLE FILES */
  async function storeMultipleFilesIPFS(files) {
    const cidWeb3 = await WEB3_CLIENT.put(files);
    const folderUrlWeb3 = `https://dweb.link/ipfs/${cidWeb3}`;
    console.log(`FOLDER URL (storeMultipleFiles) => ${folderUrlWeb3}`);
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

  /* STORE FILE WITH UPLOAD */
  async function storeUploadedFiles() {
    const files = await document.getElementById("files").files;
    console.log("FILES ARRAY => ", files);
    if (files.length === 0) {
      setFolderCidField("");
      setFileCidField("");
      setMultipleFiles([]);
      setStoreFieldMessage("Please select files");
    } else {
      let dataObj;
      setIsLoading(false);
      if (files.length >= 2) {
        dataObj = await storeMultipleFilesIPFS(files);
        const filesArr = await constructFilesArr(dataObj);
        setFolderCidField("Folder CID: " + dataObj.cid);
        setFileCidField("Files CIDs: ");
        setMultipleFiles(filesArr);
        await storeMulipleFilesOnChain(filesArr);
      } else {
        dataObj = await storeSingleFileIPFS(files[0]);
        setFolderCidField("");
        setFileCidField("File CID: " + dataObj.cid);
        setMultipleFiles([]);
        await storeSingleFileOnChain(dataObj.cid, dataObj.url);
      }
      setStoreFieldMessage("");
    }
  }

  /* STORE SINGLE FILE IN SMART CONTRACT ON BLOCKCHAIN NETWORK */
  async function storeSingleFileOnChain(cid, url) {
    const storeSingleFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "storeSingleFile",
      params: {
        cid: cid,
        url: url,
      },
    };
    setIsLoading(true);
    await runContractFunction({
      onSuccess: (results) => {
        console.log("TRANSACTION OBJECT (storeSingleFile) => ", results);
        setStoreFieldMessage(`Successfully stored file! ${results.hash}`);
      },
      onError: (error) => {
        console.log(`ERROR => ${error.message}`);
        setStoreFieldMessage(error.message);
      },
      onComplete: () => {
        document.getElementById("files").value = "";
      },
      params: storeSingleFileOptions,
    });
  }

  /* STORE MULTIPLE FILES IN SMART CONTRACT ON BLOCKCHAIN NETWORK */
  async function storeMulipleFilesOnChain(fileArr) {
    const storeMultipleFilesOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "storeMultipleFiles",
      params: {
        files: fileArr,
      },
    };
    setIsLoading(true);
    await runContractFunction({
      onSuccess: (results) => {
        console.log("TRANSACTION OBJECT (storeMultipleFiles) => ", results);
        setStoreFieldMessage(`Successfully stored files! ${results.hash}`);
      },
      onError: (error) => {
        console.log(`ERROR => ${error.message}`);
        setStoreFieldMessage(error.message);
      },
      onComplete: () => {
        document.getElementById("files").value = "";
      },
      params: storeMultipleFilesOptions,
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
          {multipleFiles.map((file, index) => (
            <p key={index}>{file.cid}</p>
          ))}
        </div>
        <div hidden={isLoading}>
          <Loader />
        </div>
        <button onClick={() => storeUploadedFiles()}>
          Store Uploaded Files
        </button>
      </div>
    </div>
  );
}
