cd Server/other
py -3.10 -m venv .venv
. .venv/Scripts/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py
