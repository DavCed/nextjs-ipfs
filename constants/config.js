module.exports = {
  contractAddress: "0xa954BFd8C4f295B1a3C8456231e759815cf96a09",
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "cid",
          type: "string",
        },
      ],
      name: "checkFiles",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllFiles",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "cid",
              type: "string",
            },
            {
              internalType: "string",
              name: "url",
              type: "string",
            },
          ],
          internalType: "struct DistributedStorage.File[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "cid",
          type: "string",
        },
      ],
      name: "getFile",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "cid",
          type: "string",
        },
        {
          internalType: "string",
          name: "url",
          type: "string",
        },
      ],
      name: "storeFile",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
