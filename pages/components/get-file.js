import { abi, contractAddress } from "../constants/config";
import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { helia2, cidJSON } from "./store-file";

export function GetFile() {
  const { runContractFunction } = useWeb3Contract();
  const [getFieldMessage, setGetFieldMessage] = useState("");
  const [getFieldOutput, setGetFieldOutput] = useState("");

  function getFileOnChain() {
    if (document.getElementById("cid").value.length > 0) {
      if (cidJSON.toString().length > 0) {
        /* GET FILE IN SMART CONTRACT ON BLOCKCHAIN */
        const getFileOptions = {
          abi: abi,
          contractAddress: contractAddress,
          functionName: "getFile",
          params: {
            cid: document.getElementById("cid").value.toString(),
          },
        };
        runContractFunction({
          onSuccess: async (results) => {
            console.log(`URL (getFile) => ${results}`);
            setGetFieldMessage("");
            setGetFieldOutput(
              new TextDecoder().decode(await helia2.blockstore.get(cidJSON)) +
                "\n" +
                results
            );
          },
          onError: (error) => {
            console.log(`ERROR => ${error}`);
          },
          params: getFileOptions,
        });
      } else {
        setGetFieldMessage("CID is not stored in Helia");
        setGetFieldOutput("");
      }
    } else {
      setGetFieldMessage("CID is required");
      setGetFieldOutput("");
    }
  }

  return (
    <div id="getField">
      <div>
        <h4>{getFieldMessage}</h4>
      </div>
      <div>
        <label>CID: </label>
        <input type="text" id="cid" size={60} />
      </div>
      <div>
        <p>{getFieldOutput}</p>
      </div>
      <div>
        <button onClick={() => getFileOnChain()}>Get File</button>
      </div>
    </div>
  );
}
