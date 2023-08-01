import { useState, React } from "react";
import { useWeb3Contract } from "react-moralis";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/environment.js";

export function GetFile() {
  const { runContractFunction } = useWeb3Contract();
  const [getFieldMessage, setGetFieldMessage] = useState("");
  const [getFieldOutput, setGetFieldOutput] = useState([]);

  async function getFileOnChain() {
    /* GET FILE IN SMART CONTRACT ON BLOCKCHAIN */
    const getFileOptions = {
      abi: CONTRACT_ABI,
      contractAddress: CONTRACT_ADDRESS,
      functionName: "getFile",
      params: {
        cid: document.getElementById("cid").value,
      },
    };
    runContractFunction({
      onSuccess: async (results) => {
        console.log(`FILE URL (getFile) => ${results}`);
        /* GET FILE FROM WEB3 STORAGE IPFS */
        const res = await fetch(results);
        const studentObj = await res.json();
        console.log("STUDENT OBJECT (getFile) => ", studentObj);
        setGetFieldMessage("");
        setGetFieldOutput([
          "Name: " + studentObj.name,
          "Age: " + studentObj.age,
          "GPA: " + studentObj.gpa,
          "Grade: " + studentObj.grade,
        ]);
      },
      onError: (error) => {
        console.log(`ERROR => ${error}`);
        setGetFieldMessage(
          error
            .toString()
            .split(" ")
            .map((w, i) =>
              i == 0
                ? w.toUpperCase() + " "
                : w.charAt(0).toUpperCase() + w.substring(1) + " "
            )
        );
        setGetFieldOutput([]);
      },
      params: getFileOptions,
    });
  }

  return (
    <>
      <br />
      <div>
        <div>
          <h4>{getFieldMessage}</h4>
        </div>
        <div>
          <label>CID: </label>
          <input type="text" id="cid" size={60} />
        </div>
        <div>
          {getFieldOutput.map((ele, index) => (
            <p key={index}>{ele}</p>
          ))}
        </div>
        <div>
          <button onClick={() => getFileOnChain()}>Get File</button>
        </div>
      </div>
    </>
  );
}
