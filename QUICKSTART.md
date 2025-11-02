Quick Start Guide
Get your Flask MCP Client running in 5 minutes!
Step 1: Create Project Structure
bashmkdir flask-mcp-client
cd flask-mcp-client

# Create directories
mkdir static
mkdir static/css
mkdir static/js
mkdir templates
Step 2: Create Files
Copy the following files from the artifacts provided:

app.py - Main application file
mcp_client.py - MCP client manager
requirements.txt - Dependencies
templates/index.html - Frontend HTML
static/css/style.css - Styling
static/js/main.js - JavaScript logic

Your structure should look like:
flask-mcp-client/
├── app.py
├── mcp_client.py
├── requirements.txt
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── templates/
    └── index.html
Step 3: Install Dependencies
bashpip install -r requirements.txt
Or manually:
bashpip install Flask==3.0.0 flask-cors==4.0.0
Step 4: Configure Your MCP Servers
Edit app.py and find the MCP_SERVERS dictionary (around line 13):
pythonMCP_SERVERS = {
    "manim": {
        "command": ["python", "C:\\Users\\chath\\manim-mcp-server\\src\\main.py"],
        "description": "Manim animation server"
    },
    # Add your servers here!
}
Change the path to match your MCP server location!
Example for multiple servers:
pythonMCP_SERVERS = {
    "manim": {
        "command": ["python", "C:\\path\\to\\manim\\main.py"],
        "description": "Manim animation server"
    },
    "filesystem": {
        "command": ["python", "C:\\path\\to\\filesystem\\server.py"],
        "description": "File system operations"
    },
    "database": {
        "command": ["python", "C:\\path\\to\\database\\server.py"],
        "description": "Database queries"
    }
}
Step 5: Run the Application
bashpython app.py
You should see:
🚀 Starting Flask MCP Client...
📡 Configured servers: manim
🌐 Open http://localhost:5000 in your browser
 * Running on http://0.0.0.0:5000
Step 6: Open in Browser
Navigate to: http://localhost:5000
Step 7: Connect to a Server

Look at the left sidebar - you'll see your configured servers
Click on a server card to connect
Wait for the status to change to 🟢 connected
Tools will appear in the right panel

Step 8: Execute a Tool

Click on any tool in the right panel
A modal will open with input fields
Fill in the parameters
Click "Execute"
See results in the chat area!

Common Issues & Solutions
Issue: "Module not found"
Solution: Make sure you installed all dependencies
bashpip install Flask flask-cors
Issue: Server won't connect
Solution: Check your MCP server path in app.py

Make sure the path exists
Make sure the file is executable
Try running the server manually first: python path/to/server.py

Issue: Port 5000 already in use
Solution: Change the port in app.py (last line):
pythonapp.run(host='0.0.0.0', port=5001, debug=True)
Issue: Tools not showing
Solution:

Make sure server is connected (🟢 status)
Check browser console for errors (F12)
Check terminal for Python errors

Issue: Blank page
Solution:

Check that templates/index.html exists
Check that static/ folder has the css and js files
Look at terminal for error messages

Testing Without MCP Server
If you don't have an MCP server yet, you can still test the UI:

Run the app: python app.py
Open http://localhost:5000
You'll see the interface
Try connecting - it will fail, but you can see the UI

Next Steps
Add More Features

Integrate an LLM: Make it truly intelligent
Add authentication: Secure your instance
Add streaming: Real-time responses
Save conversations: Store chat history
Deploy online: Put it on a server

Create Your Own MCP Server
If you want to create a custom MCP server:
python# simple_server.py
import json
import sys

def handle_request(request):
    method = request.get('method')
    
    if method == 'initialize':
        return {
            "protocolVersion": "1.0.0",
            "serverInfo": {"name": "my-server", "version": "1.0.0"}
        }
    
    elif method == 'tools/list':
        return {
            "tools": [
                {
                    "name": "hello",
                    "description": "Say hello",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Your name"}
                        },
                        "required": ["name"]
                    }
                }
            ]
        }
    
    elif method == 'tools/call':
        name = request['params']['arguments']['name']
        return {
            "content": [{"type": "text", "text": f"Hello, {name}!"}]
        }

# Main loop
for line in sys.stdin:
    request = json.loads(line)
    response = {
        "jsonrpc": "2.0",
        "id": request['id'],
        "result": handle_request(request)
    }
    print(json.dumps(response), flush=True)
Add to your MCP_SERVERS:
python"my-server": {
    "command": ["python", "simple_server.py"],
    "description": "