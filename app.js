const { Pool } = require("pg");

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 2022,
});

// Function to populate example data in the database
async function populateExampleData() {
  try {
    // Acquire a client from the connection pool
    const client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Insert example data
    await client.query(`
        INSERT INTO bitmap_tree (key, value)
        VALUES
          (1, 'Value 1'),
          (1, 'Value 2'),
          (2, 'Value 3'),
          (3, 'Value 4'),
          (3, 'Value 5'),
          (3, 'Value 6'),
          (4, 'Value 7'),
          (4, 'Value 8')
      `);

    // Commit the transaction
    await client.query("COMMIT");

    // Release the client back to the connection pool
    client.release();
  } catch (error) {
    console.error("Error populating example data:", error);

    // Rollback the transaction on error
    await client.query("ROLLBACK");
    throw error;
  }
}

// Function to construct the bitmap tree
function constructBitmapTree(data) {
  const bitmapTree = {};

  // Iterate over the data and construct the bitmap tree
  data.forEach((row) => {
    const key = row.key;
    const value = row.value;

    // Check if the key already exists in the bitmap tree
    if (key in bitmapTree) {
      bitmapTree[key].push(value);
    } else {
      bitmapTree[key] = [value];
    }
  });

  return bitmapTree;
}
// Function to visualize the bitmap tree
function visualizeBitmapTree(bitmapTree) {
  function printTree(node, level = 0, prefix = "") {
    const indent = " ".repeat(level * 2);
    const keys = Object.keys(node);

    keys.forEach((key, index) => {
      const value = node[key];
      const isLast = index === keys.length - 1;
      const connector = isLast ? "└─" : "├─";
      console.log(`${indent}${prefix}${connector} Key: ${key}`);

      if (Array.isArray(value)) {
        const valueIndent = " ".repeat((level + 1) * 2);
        console.log(`${valueIndent}${prefix}   Values: ${value.join(", ")}`);
      } else {
        printTree(value, level + 1, isLast ? "    " : "│   ");
      }
    });
  }

  console.log("Bitmap Tree:");
  printTree(bitmapTree);
}

// Main program flow
(async () => {
  try {
    // Populate example data in the database
    await populateExampleData();

    // Fetch data from the database
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM bitmap_tree");
    const data = result.rows;

    // Construct the bitmap tree
    const bitmapTree = constructBitmapTree(data);

    // Visualize the bitmap tree
    visualizeBitmapTree(bitmapTree);

    // Release the client back to the connection pool
    client.release();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
})();
