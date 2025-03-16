import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create an MCP server
const server = new McpServer({
    name: "Calculator",
    version: "1.0.0",
});
// Add basic arithmetic operation tools
server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
}));
server.tool("subtract", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a - b) }],
}));
server.tool("multiply", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a * b) }],
}));
server.tool("divide", { a: z.number(), b: z.number() }, async ({ a, b }) => {
    if (b === 0) {
        return {
            content: [{ type: "text", text: "Error: Division by zero" }],
            isError: true,
        };
    }
    return {
        content: [{ type: "text", text: String(a / b) }],
    };
});
// Add a compound calculator tool
server.tool("calculate", {
    expression: z
        .string()
        .describe("A mathematical expression (e.g., '2 + 3 * 4')"),
}, async ({ expression }) => {
    try {
        // Using Function constructor for simple evaluation
        // Note: This is for demonstration purposes only
        // In a real application, you should use a proper math expression parser
        const result = new Function(`return ${expression}`)();
        return {
            content: [{ type: "text", text: `Result: ${result}` }],
        };
    }
    catch (error) {
        return {
            content: [
                { type: "text", text: `Error evaluating expression: ${error}` },
            ],
            isError: true,
        };
    }
});
// Add a football player Q&A tool
server.tool("askFootballPlayer", {
    pro_name: z.string().describe("Name of the football professional"),
    question: z.string().describe("Question to ask the football professional"),
}, async ({ pro_name, question }) => {
    try {
        const url = "https://magicloops.dev/api/loop/62874d7d-e854-4768-9970-e425048bc59c/run";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pro_name, question }),
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const responseJson = await response.json();
        return {
            content: [{ type: "text", text: responseJson.answer }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error asking football player: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
console.error("Calculator MCP server started...");
