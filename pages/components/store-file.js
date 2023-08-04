import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { File, Web3Storage } from "web3.storage";
import { API_TOKEN, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function StoreFile() {
  const { runContractFunction } = useWeb3Contract();
  const [storeFieldMessage, setStoreFieldMessage] = useState("");

  /* STORE IN WEB3 STORAGE IPFS */
  async function storeInIPFS(file) {
    const storage = new Web3Storage({ token: API_TOKEN });
    const cidWeb3 = await storage.put([file]);
    const fileUrlWeb3 = `https://${cidWeb3}.ipfs.dweb.link/student.json`;
    const folderUrlWeb3 = `https://dweb.link/ipfs/${cidWeb3}`;
    console.log(`FILE URL (storeFile) => ${fileUrlWeb3}`);
    console.log(`FOLDER URL (storeFile) => ${folderUrlWeb3}`);
    return [cidWeb3.toString(), fileUrlWeb3];
  }

  /* STORE IN SMART CONTRACT ON BLOCKCHAIN NETWORK */
  async function storeFileOnChain(cid, url, fileUploaded) {
    const storeFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "storeFile",
      params: {
        cid: cid,
        url: url,
      },
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log("TRANSACTION OBJECT (storeFile) => ", results);
        setStoreFieldMessage(`Successfully stored file! ${results.hash}`);
      },
      onError: (error) => {
        console.log(`ERROR => ${error.message}`);
        setStoreFieldMessage(error.message);
      },
      onComplete: () => {
        if (!fileUploaded) {
          resetInputFields();
        } else document.getElementById("files").value = "";
      },
      params: storeFileOptions,
    });
  }

  /* STORE FILE WITH UPLOAD */
  async function storeUploadedFile() {
    const files = await document.getElementById("files").files;
    console.log("FILES ARRAY => ", files);
    if (files.length > 0) {
      const dataArr = await storeInIPFS(files[0]);
      document.getElementById("cid").value = dataArr[0];
      await storeFileOnChain(dataArr[0], dataArr[1], true);
      setStoreFieldMessage("");
    } else setStoreFieldMessage("Please upload a file");
  }

  /* STORE FILE WITH INPUT FIELDS */
  async function storeEnteredFile() {
    if (
      document.getElementById("name").value.length > 0 &&
      document.getElementById("age").value.length > 0 &&
      document.getElementById("gpa").value.length > 0 &&
      document.getElementById("grade").value.length > 0
    ) {
      const student = constructJSONObject();
      const file = new File([student], "student.json", { type: "json" });
      const dataArr = await storeInIPFS(file);
      document.getElementById("cid").value = dataArr[0].toString();
      await storeFileOnChain(dataArr[0], dataArr[1], false);
    } else setStoreFieldMessage("Please fill out input fields");
  }

  /* CONSTRUCT STUDENT OBJECT FROM INPUT FIELDS */
  function constructJSONObject() {
    return JSON.stringify({
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      gpa: document.getElementById("gpa").value,
      grade: document.getElementById("grade").value,
    });
  }

  /* SET BLANK INPUT FIELDS */
  function resetInputFields() {
    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("gpa").value = "";
    document.getElementById("grade").value = "";
  }

  return (
    <div>
      <h4>{storeFieldMessage}</h4>
      <div>
        <div>
          <input type="file" id="files" />
        </div>
        <button onClick={() => storeUploadedFile()}>Store Uploaded File</button>
      </div>
      <br />
      <div>
        <label>Name: </label>
        <input type="text" id="name" size={15} />
      </div>
      <div>
        <label>Age: </label>
        <input type="text" id="age" size={1} />
      </div>
      <div>
        <label>Gpa: </label>
        <input type="text" id="gpa" size={1} />
      </div>
      <div>
        <label>Grade: </label>
        <input type="text" id="grade" size={8} />
      </div>
      <button onClick={() => storeEnteredFile()}>Store Entered File</button>
    </div>
  );
}
