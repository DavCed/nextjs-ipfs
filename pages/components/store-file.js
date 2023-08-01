import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { File, Web3Storage } from "web3.storage";
import { API_TOKEN, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function StoreFile() {
  const { runContractFunction } = useWeb3Contract();
  const [storeFieldMessage, setStoreFieldMessage] = useState("");

  async function storeFileOnChain() {
    if (
      document.getElementById("name").value.length > 0 &&
      document.getElementById("age").value.length > 0 &&
      document.getElementById("gpa").value.length > 0 &&
      document.getElementById("grade").value.length > 0
    ) {
      /* CONSTRUCT STUDENT OBJECT FROM INPUT FIELDS */
      const studentObj = JSON.stringify({
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gpa: document.getElementById("gpa").value,
        grade: document.getElementById("grade").value,
      });

      /* STORE IN WEB3 STORAGE IPFS */
      const storage = new Web3Storage({ token: API_TOKEN });
      const file = new File([studentObj], "student.json", { type: "json" });
      const cidWeb3 = await storage.put([file]);
      const fileUrlWeb3 = `https://${cidWeb3}.ipfs.dweb.link/student.json`;
      const folderUrlWeb3 = `https://dweb.link/ipfs/${cidWeb3}`;
      console.log(`FILE URL (storeFile) => ${fileUrlWeb3}`);
      console.log(`FOLDER URL (storeFile) => ${folderUrlWeb3}`);

      /* STORE IN SMART CONTRACT ON BLOCKCHAIN NETWORK */
      const storeFileOptions = {
        abi: CONTRACT_ABI,
        contractAddress: CONTRACT_ADDRESS,
        functionName: "storeFile",
        params: {
          cid: cidWeb3.toString(),
          url: fileUrlWeb3,
        },
      };
      runContractFunction({
        onSuccess: (results) => {
          console.log("TRANSACTION OBJECT (storeFile) => ", results);
          setStoreFieldMessage(`Successfully Stored File! ${results.hash}`);
          document.getElementById("name").value = "";
          document.getElementById("age").value = "";
          document.getElementById("gpa").value = "";
          document.getElementById("grade").value = "";
        },
        onError: (error) => {
          console.log(`ERROR => ${error.message}`);
          setStoreFieldMessage(error.message.toUpperCase());
        },
        params: storeFileOptions,
      });

      /* SET CID FIELD TO VALUE */
      document.getElementById("cid").value = cidWeb3.toString();
    } else setStoreFieldMessage("Please Fill Out Input Fields");
  }

  return (
    <div>
      <div>
        <h4>{storeFieldMessage}</h4>
      </div>
      <div>
        <label>Name: </label>
        <input type="text" id="name" size={15} />
      </div>
      <div>
        <label>Age: </label>
        <input type="text" id="age" size={1} />
      </div>
      <div>
        <label>GPA: </label>
        <input type="text" id="gpa" size={1} />
      </div>
      <div>
        <label>Grade: </label>
        <input type="text" id="grade" size={8} />
      </div>
      <button onClick={() => storeFileOnChain()}>Store File</button>
    </div>
  );
}
