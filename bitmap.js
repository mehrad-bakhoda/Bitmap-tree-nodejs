// Import the ESM module loader to enable ES modules in Node.js
require = require("esm")(module);

// Import the Express library for creating a web server
const express = require("express");
// Create an Express application
const app = express();
// Import the D3 library for data visualization
const d3 = import("d3");

// Define a class for the nodes in the binary tree
class BitmapNode {
  constructor(value) {
    // Store the value of the node
    this.value = value;
    // Initialize left and right child pointers to null
    this.left = null;
    this.right = null;
  }
}

// Define a class for the binary tree
class BitmapTree {
  constructor() {
    // Initialize the root of the tree to null
    this.root = null;
  }

  // Method to insert a value into the tree
  insert(value) {
    // Create a new node with the given value
    const newNode = new BitmapNode(value);

    // If the tree is empty, set the root to the new node
    if (this.root === null) {
      this.root = newNode;
    } else {
      // Otherwise, insert the new node in the correct position
      this.insertNode(this.root, newNode);
    }
  }

  // Helper method to insert a new node into the tree
  insertNode(node, newNode) {
    // If the new node's value is less than the current node's value
    if (newNode.value < node.value) {
      // If the current node has no left child, set its left child to the new node
      if (node.left === null) {
        node.left = newNode;
      } else {
        // Otherwise, recursively insert the new node in the left subtree
        this.insertNode(node.left, newNode);
      }
    } else {
      // If the current node has no right child, set its right child to the new node
      if (node.right === null) {
        node.right = newNode;
      } else {
        // Otherwise, recursively insert the new node in the right subtree
        this.insertNode(node.right, newNode);
      }
    }
  }

  // Method to search for a value in the tree
  search(value) {
    // Start the search at the root of the tree
    return this.searchNode(this.root, value);
  }

  // Helper method to search for a value in the tree
  searchNode(node, value) {
    // If the current node is null, the value is not in the tree
    if (node === null) {
      return false;
    }

    // If the value matches the current node's value, return true
    if (value === node.value) {
      return true;
    } else if (value < node.value) {
      // If the value is less than the current node's value, search the left subtree
      return this.searchNode(node.left, value);
    } else {
      // If the value is greater than the current node's value, search the right subtree
      return this.searchNode(node.right, value);
    }
  }

  // Method to generate data for the D3 graph
  generateGraphData() {
    // Start generating data at the root of the tree
    return this.generateGraphDataNode(this.root);
  }

  // Helper method to generate data for the D3 graph
  generateGraphDataNode(node) {
    // If the current node is null, return null
    if (node === null) {
      return null;
    }

    // Create a graph node object with the current node's value and an empty children array
    const graphNode = {
      id: node.value.toString(),
      label: node.value.toString(),
      children: [],
    };

    // Generate data for the left and right children
    const leftNode = this.generateGraphDataNode(node.left);
    const rightNode = this.generateGraphDataNode(node.right);

    // If the left child exists, add its data to the children array
    if (leftNode !== null) {
      graphNode.children.push(leftNode);
    }

    // If the right child exists, add its data to the children array
    if (rightNode !== null) {
      graphNode.children.push(rightNode);
    }

    // Return the graph node object
    return graphNode;
  }
}

// Create a new binary tree and insert some values
const bitmapTree = new BitmapTree();

bitmapTree.insert(5);
bitmapTree.insert(3);
bitmapTree.insert(7);
bitmapTree.insert(1);
bitmapTree.insert(4);

// Define the route for the root path of the web server
app.get("/", async (req, res) => {
  const graphData = bitmapTree.generateGraphData();
  const html = `
      <html>
        <head>
          <title>Bitmap Tree Visualization</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f8f8;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
  
            #container {
              width: 800px;
              height: 600px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
              border-radius: 10px;
              overflow: hidden;
              background-color: white;
            }
  
            #title {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              margin: 0;
              background-color: #333;
              color: white;
            }
          </style>
        </head>
        <body>
          <div id="container">
            <h1 id="title">Bitmap Tree Visualization</h1>
            <svg id="graph" width="800" height="500"></svg>
          </div>
          <script src="https://d3js.org/d3.v7.min.js"></script>
          <script>
            const graphData = ${JSON.stringify(graphData)};
  
            const width = 800;
            const height = 500;
  
            const svg = d3.select("#graph")
              .attr("width", width)
              .attr("height", height);
  
            const treeLayout = d3.tree()
              .size([width, height - 100]);
  
            const root = d3.hierarchy(graphData);
            const links = treeLayout(root).links();
            const nodes = root.descendants();
  
            const linkGroup = svg.append("g")
              .selectAll("path")
              .data(links)
              .join("path")
              .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y + 50)) // Adjusted y-coordinate for top node
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("stroke-width", 2);
  
            const nodeGroup = svg.append("g")
              .selectAll("circle")
              .data(nodes)
              .join("circle")
              .attr("cx", d => d.x)
              .attr("cy", d => d.y + 50) // Adjusted y-coordinate for top node
              .attr("r", 20)
              .attr("fill", "lightblue")
              .attr("stroke", "black")
              .attr("stroke-width", 2);
  
            const labelGroup = svg.append("g")
              .selectAll("text")
              .data(nodes)
              .join("text")
              .attr("x", d => d.x)
              .attr("y", d => d.y + 50) // Adjusted y-coordinate for top node
              .attr("dy", "0.35em")
              .attr("text-anchor", "middle")
              .attr("font-size", "14px")
              .text(d => d.data.label);
          </script>
        </body>
      </html>
    `;
  res.send(html);
});

// Start the web server on port 3000
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
