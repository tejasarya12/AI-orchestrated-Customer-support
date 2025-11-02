Directory Structure to Create:
project_root/
├── utils/               # 🆕 Create this folder
├── models/              # 🆕 Create this folder
├── uploads/             # 🆕 Create this folder
├── vector_db/           # 🆕 Create this folder
├── static/audio/        # 🆕 Create this folder
├── docs/                # 🆕 Create this folder
└── langgraph_flow/      


 Implementation Steps
Step 1: Backup Existing Files
bash# Backup files that will be modified
cp app.py app.py.backup
cp langgraph_flow/nodes.py langgraph_flow/nodes.py.backup
cp requirements.txt requirements.txt.backup
Step 2: Create Directory Structure
bashmkdir -p utils models uploads vector_db static/audio docs
Step 3: Create Package Init Files
bashtouch utils/__init__.py
touch langgraph_flow/__init__.py  # if doesn't exist
Step 4: Add New Files
Create all 14 new files listed above:

3 core files (config, model_loader, ocr_processor)
5 helper files (download, test, env, init scripts)
4 documentation files
2 package markers

Step 5: Replace Modified Files
Replace these 3 files completely:

app.py
langgraph_flow/nodes.py
requirements.txt

Step 6: Install Dependencies
bashpip install -r requirements.txt
Step 7: Download Models
bashpython download_models.py
Step 8: Configure Environment
bashcp .env.example .env
# Edit .env if using email features
Step 9: Test Setup
bashpython test_models.py
Step 10: Run Application
bashpython app.py