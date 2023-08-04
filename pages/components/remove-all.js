import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function RemoveAll() {
  const { runContractFunction } = useWeb3Contract();
  const [removeAllFieldMessage, setRemoveAllFieldMessage] = useState("");

  /* REMOVE FILES IN SMART CONTRACT ON BLOCKCHAIN */
  function removeAllFilesOnChain() {
    const removeAllFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "removeAllFiles",
    };
    runContractFunction({
      onSuccess: (results) => {
        console.log("TRANSACTION OBJECT (removeFiles) => ", results);
        setRemoveAllFieldMessage("");
      },
      onError: (error) => {
        console.log("ERROR => ", error);
        setRemoveAllFieldMessage(error.message);
      },
      params: removeAllFileOptions,
    });
  }

  return (
    <>
      <br />
      <div>
        <div>
          <h4>{removeAllFieldMessage}</h4>
        </div>
        <div>
          <button onClick={() => removeAllFilesOnChain()}>
            Remove All Files
          </button>
        </div>
      </div>
    </>
  );
}
