import bodyParser from "body-parser";
import express from "express";
import { BASE_NODE_PORT } from "../config";
import { Value } from "../types";
import { startConsensus, stopConsensus } from "./consensus";
import { NodeState } from "../types"; 


export async function node(
  nodeId: number, // the ID of the node
  N: number, // total number of nodes in the network
  F: number, // number of faulty nodes in the network
  initialValue: Value, // initial value of the node
  isFaulty: boolean, // true if the node is faulty, false otherwise
  nodesAreReady: () => boolean, // used to know if all nodes are ready to receive requests
  setNodeIsReady: (index: number) => void // this should be called when the node is started and ready to receive requests
) {
  const node = express();
  node.use(express.json());
  node.use(bodyParser.json());

  let nodeState: NodeState = {
    killed: false,
    x: initialValue,
    decided: null,
    k: null
  };
 
  // this route allows retrieving the current status of the node
  node.get("/status", (req, res) => {
    if (isFaulty) {
      res.status(500).send('faulty');
    } else {
      res.status(200).send('live');
    }
  });



  // this route allows the node to receive messages from other nodes
  node.post("/message", (req, res) => {
    const message = req.body.message;
  // Message processing todo
  res.status(200).send('Message received');
  });

  
  // this route is used to start the consensus algorithm
  node.get("/start", async (req, res) => {
    try {
      
      await startConsensus(N);
  
      res.status(200).send('Consensus algorithm started');
    } catch (error) {
      res.status(500).send('Error starting consensus algorithm');
    }
  });


  // this route is used to stop the consensus algorithm
  node.get("/stop", async (req, res) => {
    try {
      await stopConsensus(N);  
      res.status(200).send('Consensus algorithm stopped');
    } catch (error) {
      res.status(500).send('Error stopping consensus algorithm');
    }
  });

  // get the current state of a node
  node.get("/getState", (req, res) => {
    try {
      res.status(200).json({nodeState});
    } catch (error) {
      res.status(500).send('Error getting node state');
    }
  });
  // start the server
  const server = node.listen(BASE_NODE_PORT + nodeId, async () => {
    console.log(
      `Node ${nodeId} is listening on port ${BASE_NODE_PORT + nodeId}`
    );

    // the node is ready
    setNodeIsReady(nodeId);
  });

  return server;
}
